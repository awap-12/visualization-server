const { DataTypes, Model } = require("sequelize");
const base62 = require("../utils/base62");

module.exports = sequelize => {
    class Chart extends Model {
        static associate({ User, Chart }) {
            Chart.belongsTo(User, {
                foreignKey: "userId",
                onDelete: "CASCADE", // user remove -> chart remove
                as: "user"
            });
            User.hasMany(Chart, {
                foreignKey: "userId",
                as: "chart"
            });
        }
    }

    Chart.init({
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
        }
    }, {
        sequelize,
        tableName: "chart",
        timestamps: false,
        hooks: {
            async beforeCreate(instance) {
                if (!!instance.id) return;
                let result = null, flag = true;
                while (flag) flag = !!await Chart.findByPk((result = base62(6)));
                instance.setDataValue("id", result);
            },
            async beforeBulkCreate(instances) {
                for (const instance of instances) {
                    if (!!instance.id) break;
                    let result = null, flag = true;
                    while (flag) flag = !!await Chart.findByPk((result = base62(6)));
                    instance.setDataValue("id", result);
                }
            },
            async beforeDestroy(instance) {
                const { Files } = await Chart.findByPk(instance.id, {
                    include: {
                        model: instance.sequelize.models.File,
                        attributes: ["path"],
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
