const { DataTypes, Model } = require("sequelize");
const base62 = require("serve/utils/base62.js");

const VIEW_ID_LENGTH = 6;

module.exports = sequelize => {
    const ViewChart = sequelize.define("ViewChart", {}, { timestamps: false, underscored: true });

    class View extends Model {
        static associate({ User, View, Chart }) {
            View.belongsToMany(Chart, {
                through: ViewChart,
                foreignKey: "viewId",
                otherKey: "chartId"
            });
            Chart.belongsToMany(View, {
                through: ViewChart,
                foreignKey: "chartId",
                otherKey: "viewId"
            });
            User.hasMany(View, {
                foreignKey: "userId",
                as: "view"
            });
            View.belongsTo(User, {
                foreignKey: "userId",
                onDelete: "CASCADE", // user remove -> chart remove
                as: "user"
            });
        }
    }

    View.init({
        id: {
            type: DataTypes.STRING(VIEW_ID_LENGTH),
            primaryKey: true,
            unique: true
        },
        display: {
            type: DataTypes.ENUM("grid", "flex"),
            defaultValue: "grid"
        },
        description: {
            type: DataTypes.STRING(1024),
            defaultValue: ''
        }
    }, {
        sequelize,
        tableName: "view",
        timestamps: false,
        hooks: {
            async beforeCreate(instance) {
                let result = instance.id ?? base62(VIEW_ID_LENGTH), flag = true;
                do {
                    flag = !!await View.findByPk(result);
                } while (flag && !!(result = base62(VIEW_ID_LENGTH)));
                instance.setDataValue("id", result);
            }
        }
    });

    return View;
};
