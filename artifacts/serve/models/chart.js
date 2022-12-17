const { DataTypes, Model } = require("sequelize");
const base62 = require("../utils/base62.js");

const CHART_ID_LENGTH = 6;

module.exports = sequelize => {
    class Chart extends Model {
        static associate({ User, Chart }) {
            User.hasMany(Chart, {
                foreignKey: "userId",
                as: "chart"
            });
            Chart.belongsTo(User, {
                foreignKey: "userId",
                onDelete: "CASCADE", // user remove -> chart remove
                as: "user"
            });
        }
    }

    Chart.init({
        id: {
            type: DataTypes.STRING(CHART_ID_LENGTH),
            primaryKey: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(1024),
            defaultValue: ''
        }
    }, {
        sequelize,
        tableName: "chart",
        timestamps: false,
        hooks: {
            async beforeCreate(instance) {
                let result = instance.id ?? base62(CHART_ID_LENGTH), flag = true;
                do {
                    flag = !!await Chart.findByPk(result);
                } while (flag && !!(result = base62(CHART_ID_LENGTH)));
                instance.setDataValue("id", result);
            },
            async beforeDestroy(instance) {
                const { Files } = await Chart.findByPk(instance.id, {
                    include: {
                        model: instance.sequelize.models.File,
                        attributes: ["url"],
                        include: Chart
                    },
                    attributes: []
                });
                await Promise.all(Files.map(async file => {
                    if (file.Charts.length === 1) // only one
                        await file.destroy();
                }));
            }
        }
    });

    return Chart;
};
