const { DataTypes, Model } = require("sequelize");
const base62 = require("../utils/base62");

module.exports = sequelize => {
    class View extends Model {
        static associate({ User }) {
            View.belongsTo(User, {
                foreignKey: "userId",
                as: "user"
            });
        }
    }

    View.init({
        id: {
            type: DataTypes.STRING(6),
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
        },
        files: {
            type: DataTypes.STRING(512),
            allowNull: false,
            get() {
                return this.getDataValue("files")?.split(",");
            },
            set(value) {
                this.setDataValue("files", Array.isArray(value) ? value.join(",") : value);
            }
        }
    }, {
        sequelize,
        tableName: "view",
        timestamps: false,
        hooks: {
            beforeCreate(instance) {
                if (instance.id?.includes("default")) return;
                let result = null, flag = null;
                while (flag === null) {
                    flag = instance.findByPk((result = base62(6)))
                }
                instance.setDataValue("id", result);
            },
            beforeBulkCreate(instances) {
                for (const instance of instances) {
                    if (instance.id?.includes("default")) break;
                    let result = null, flag = null;
                    while (flag === null) {
                        flag = instance.findByPk((result = base62(6)))
                    }
                    instance.setDataValue("id", result);
                }
            }
        }
    });

    return View;
};
