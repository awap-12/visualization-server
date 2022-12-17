const { DataTypes, Model } = require("sequelize");
const file = require("../../utils/file.js");

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
                const target = await file.move(instance.path, instance.getDataValue("fileId"));
                instance.setDataValue("path", target);
            },
            async beforeUpdate(instance) {
                // update is more like override, not for updating data
                const target = await file.move(instance.path, instance.getDataValue("fileId"));
                // update instance data for override import data
                instance.set("path", target);
            },
            async beforeDestroy(instance) {
                await file.remove(instance.path);
            }
        }
    });

    return Local;
};
