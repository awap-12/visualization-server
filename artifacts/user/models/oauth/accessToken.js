const { DataTypes, Model } = require("sequelize");

module.exports = sequelize => {
    class OAuthAccessToken extends Model {
        static associate({ OAuthClient, User }) {
            OAuthAccessToken.belongsTo(OAuthClient, {
                foreignKey: "clientId",
                as: "client"
            });
            OAuthAccessToken.belongsTo(User, {
               foreignKey: "userId",
                as: "user"
            });
        }
    }

    OAuthAccessToken.init({
        accessToken: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        accessTokenExpiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        scope: {
            type: DataTypes.STRING,
            defaultValue: ''
        }
    }, {
        sequelize,
        tableName: "oauth_access_tokens",
        timestamps: false
    });

    return OAuthAccessToken;
};
