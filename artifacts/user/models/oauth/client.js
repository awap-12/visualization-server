const { DataTypes, Model } = require("sequelize");
const base62 = require("../../utils/base62");

const CLIENT_ID_GENERATE_LENGTH = 16;

module.exports = sequelize => {
    class OAuthClient extends Model {}

    OAuthClient.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
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
        timestamps: false,
        hooks: {
            async beforeCreate(instance) {
                let result = instance.id ?? base62(CLIENT_ID_GENERATE_LENGTH), flag = true;
                do {
                    flag = !!await OAuthClient.findByPk(result);
                } while (flag && !!(result = base62(CLIENT_ID_GENERATE_LENGTH)));
                instance.setDataValue("id", result);
            }
        }
    });

    return OAuthClient;
};
