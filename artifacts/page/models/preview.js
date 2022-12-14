const { DataTypes, Model } = require("sequelize");

module.exports = sequelize => {
    class Preview extends Model {
        static associate({ Chart, Preview }) {
            Chart.hasOne(Preview, {
                foreignKey: "chartId",
                as: "preview"
            });
            Preview.belongsTo(Chart, {
                foreignKey: "chartId"
            });
        }
    }

    Preview.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        data: {
            type: DataTypes.BLOB("long"),
            allowNull: false
        }
    }, {
        sequelize,
        tableName: "preview",
        timestamps: false,
        underscored: true,
        indexes: [{
            fields: ["chart_id"],
            unique: true
        }]
    });

    return Preview;
};
