const { DataTypes, Model } = require("sequelize");
const base36 = require("../../utils/base36");

const TABLE_NAME_GENERATE_LENGTH = 12;

module.exports = sequelize => {
    class Database extends Model {
        static associate({ File, Database }) {
            File.hasOne(Database, {
                foreignKey: "fileId",
                as: "database"
            });
            Database.belongsTo(File, {
                foreignKey: "fileId"
            });
        }
    }

    Database.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        table: {
            type: DataTypes.STRING(12),
            allowNull: false,
            unique: true
        },
        columns: {
            type: DataTypes.STRING,
            allowNull: false,
            get() {
                return this.getDataValue("columns")?.split(",");
            },
            set(value) {
                this.setDataValue("columns", Array.isArray(value) ? value.join(",") : value);
            }
        },
        data: {
            type: DataTypes.VIRTUAL,
            get() {
                const tableName = this.getDataValue("table");
                // pending, not require to execute each time
                return sequelize.models[tableName].findAll({
                    attributes: {
                        exclude: ["id"]
                    }
                });
            },
            set() {
                throw new Error("still in todo list, might be good to combine with file update");
            }
        }
    }, {
        sequelize,
        tableName: "database",
        timestamps: false,
        underscored: true,
        indexes: [{
            fields: ["file_id"],
            unique: true
        }],
        hooks: {
            async beforeValidate(instance) {
                let result = instance.table ?? base36(TABLE_NAME_GENERATE_LENGTH), flag = true;
                do {
                    flag = !!await Database.findOne({ where: { table: result } });
                } while (flag && !!(result = base36(TABLE_NAME_GENERATE_LENGTH)));
                instance.setDataValue("table", result);
            },
            async beforeCreate(instance) {
                await sequelize.define(instance.table, {
                    ...(instance.columns?.reduce((pre, cur) => {
                        return { ...pre, [cur]: DataTypes.STRING };
                    }, {}))
                }, {
                    freezeTableName: true,
                    timestamps: false,
                }).sync();
            },
            async beforeDestroy(instance) {
                const model = instance.sequelize.models[instance.table];
                if (!model) throw new Error("table not exist");
                await model.drop();
            }
        }
    });

    return Database;
};
