const { DataTypes, Model } = require("sequelize");

module.exports = sequelize => {
    class OAuthRefreshToken extends Model {
        static associate({ OAuthClient, User }) {
            OAuthRefreshToken.belongsTo(OAuthClient, {
                foreignKey: "clientId",
                as: "client"
            });
            OAuthRefreshToken.belongsTo(User, {
                foreignKey: "userId",
                as: "user"
            });
        }
    }

    OAuthRefreshToken.init({
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        refreshTokenExpiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        scope: {
            type: DataTypes.STRING,
            defaultValue: ''
        }
    }, {
        sequelize,
        tableName: "oauth_refresh_tokens",
        timestamps: false
    });

    return OAuthRefreshToken;
};
