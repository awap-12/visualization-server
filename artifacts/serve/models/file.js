const debug = require("debug")("handle:file");
const { DataTypes, Model } = require("sequelize");
const path = require("node:path");
const fs = require("node:fs");

const ROOT = path.resolve(__dirname, "..");

module.exports = sequelize => {
    const ChartFile = sequelize.define("ChartFile", {}, { timestamps: false, underscored: true });

    class File extends Model {
        static associate({ Chart, File }) {
            File.belongsToMany(Chart, {
                through: ChartFile
            });
            Chart.belongsToMany(File, {
                through: ChartFile
            });
        }
    }

    File.init({
        url: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        info: {
            type: DataTypes.STRING,
            defaultValue: ''
        },
        // for file same detect
        size: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        sequelize,
        tableName: "file",
        timestamps: false,
        hooks: {
            afterDestroy(instance) {
                const filePath = path.join(ROOT, instance.url);
                fs.access(filePath, err => {
                    if (!err) {
                        fs.unlink(filePath, err => {
                            if (!err) {
                                debug("remove %s", filePath);
                            } else {
                                debug("unable to remove %s", filePath);
                            }
                        });
                    } else {
                        debug("can not find %s", filePath);
                    }
                });
            }
        }
    });

    return File;
};
