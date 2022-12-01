const debug = require("debug")("config:model");

module.exports = sequelize => {
    const models = {
        /** Oauth models */
        //OAuthAccessToken: require("../artifacts/user/models/oauth/accessToken")(sequelize),
        //OAuthRefreshToken: require("../artifacts/user/models/oauth/refreshToken")(sequelize),
        //OAuthAuthorizationCode: require("../artifacts/user/models/oauth/authorizationCode")(sequelize),
        //OAuthClient: require("../artifacts/user/models/oauth/client")(sequelize),
        /** User models */
        //User: require("../artifacts/user/models/user")(sequelize)
    }

    for (const name in models) {
        if ("associate" in models[name]) {
            models[name].associate(models)
        }
    }

    debug("models relation linked");
};

