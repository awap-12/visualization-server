const { DataTypes, Model } = require("sequelize");

module.exports = sequelize => {
    class OAuthAuthorizationCode extends Model {
        static associate({ OAuthClient, User }) {
            OAuthAuthorizationCode.belongsTo(OAuthClient, {
                foreignKey: "clientId",
                as: "client"
            });
            OAuthAuthorizationCode.belongsTo(User, {
                foreignKey: "userId",
                as: "user"
            });
        }
    }

    OAuthAuthorizationCode.init({
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        expires: {
            type: DataTypes.DATE,
            allowNull: false
        },
        redirectUri: DataTypes.STRING(2000),
        scope: {
            type: DataTypes.STRING,
            defaultValue: ''
        }
    }, {
        sequelize,
        tableName: "oauth_authorization_codes",
        timestamps: false,
    });

    return OAuthAuthorizationCode;
};
