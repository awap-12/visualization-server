const debug = require("debug")("handle:localstorage");
const { DataTypes, Model } = require("sequelize");
const file = require("../../utils/file");
const fs = require("node:fs/promises");

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
            async beforeValidate(instance) {
                await fs.access(instance.path);
                debug("validate success: find %s resource", instance.path);
            },
            async beforeUpdate(instance) {
                const { path } = instance.sequelize.models.Local.findByPk(instance.id);
                await file.move(path, instance.path);
                debug("move file: %s -> %s", path, instance.path);
            },
            async beforeDestroy(instance) {
                await file.remove(instance.path);
                debug("remove file: %s", instance.path);
            }
        }
    });

    return Local;
};
