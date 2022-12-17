const { DataTypes, Model } = require("sequelize");

module.exports = sequelize => {
    class Preview extends Model {
        static associate({ View, Preview }) {
            View.hasOne(Preview, {
                foreignKey: "viewId",
                onDelete: "CASCADE",
                as: "preview"
            });
            Preview.belongsTo(View, {
                foreignKey: "viewId"
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
            fields: ["view_id"],
            unique: true
        }]
    });

    return Preview;
};
