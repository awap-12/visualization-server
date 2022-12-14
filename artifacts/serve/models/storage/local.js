const debug = require("debug")("handle:localstorage");
const { DataTypes, Model } = require("sequelize");
const file = require("../../utils/file");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");

module.exports = sequelize => {
    class Local extends Model {
        static associate({ File, Local }) {
            File.hasOne(Local, {
                foreignKey: "fileId",
                as: "local"
            });
            Local.belongsTo(File, {
                foreignKey: "fileId"
            });
        }
    }

    Local.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        path: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        tableName: "local",
        timestamps: false,
        underscored: true,
        indexes: [{
            fields: ["file_id"],
            unique: true
        }],
        hooks: {
            async beforeCreate(instance) {
                const target = path.join(ROOT, instance.getDataValue("fileId"));
                await file.move(instance.path, target);
                debug("move file: %s -> %s", instance.path, target);
                instance.setDataValue("path", target);
            },
            async beforeUpdate(instance) {
                // update is more like override, not for updating data
                const target = path.join(ROOT, instance.getDataValue("fileId"));
                await file.move(instance.path, target);
                debug("move file: %s -> %s", instance.path, target);
                // update instance data for override import data
                instance.set("path", target);
            },
            async beforeDestroy(instance) {
                await file.remove(instance.path);
                debug("remove file: %s", instance.path);
            }
        }
    });

    return Local;
};
