const debug = require("debug")("handle:file");
const { DataTypes, Model } = require("sequelize");
const path = require("node:path");
const fs = require("node:fs");

const { NODE_ENV } = process.env;

const isDev = NODE_ENV === "development";

const ROOT = path.resolve(__dirname, "..", isDev ? "test" : '');

module.exports = sequelize => {
    class File extends Model {
        static associate({ Chart, File }) {
            File.belongsToMany(Chart, {
                through: "ChartFile"
            });
            Chart.belongsToMany(File, {
                through: "ChartFile"
            });
        }
    }

    File.init({
        path: {
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
        hooks: {
            afterDestroy(instance) {
                const filePath = path.join(ROOT, instance.path);
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
