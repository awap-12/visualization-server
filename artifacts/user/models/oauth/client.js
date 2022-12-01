const { DataTypes, Model } = require("sequelize");

module.exports = sequelize => {
    class OAuthClient extends Model {}

    OAuthClient.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true
        },
        secret: DataTypes.STRING,
        redirectUris: {
            type: DataTypes.STRING(2000),
            get() {
                return this.getDataValue("redirectUris")?.split(",");
            },
            set(value) {
                this.setDataValue("redirectUris", Array.isArray(value) ? value.join(",") : value);
            }
        },
        grants: {
            type: DataTypes.STRING,
            get() {
                return this.getDataValue("grants")?.split(",");
            },
            set(value) {
                this.setDataValue("grants", Array.isArray(value) ? value.join(",") : value);
            }
        },
        scope: {
            type: DataTypes.STRING,
            defaultValue: ''
        }
    }, {
        sequelize,
        tableName: "oauth_client",
        timestamps: false
    });

    return OAuthClient;
};
