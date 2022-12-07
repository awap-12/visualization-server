const { DataTypes, Model } = require("sequelize");

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
        strategy: {
            type: DataTypes.ENUM("local", "database"),
            defaultValue: "local",
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
            async beforeDestroy(instance, options) {
                // because of destroy with foreign key can not trigger model hooks
                // so, we have to remove all instances by hand.
                // IMPORTANT !! remember not add CASCADE or hooks into relationship
                const { File, Local, Database } = instance.sequelize.models;
                const { local, database } = await File.findByPk(instance.url, {
                    include: [
                        { model: Local, as: "local" },
                        { model: Database, as: "database" }
                    ]
                });
                await Promise.all([local, database].map(async value => {
                    if (!!value) await value.destroy({ where: { id: value.id } });
                }));
            }
        }
    });

    return File;
};
