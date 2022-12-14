const debug = require("debug")("config:model");

module.exports = sequelize => {
    const models = {
        /** Serve models */
        Chart: require("../artifacts/serve/models/chart")(sequelize),
        File: require("../artifacts/serve/models/file")(sequelize),
        Local: require("../artifacts/serve/models/storage/local")(sequelize),
        Database: require("../artifacts/serve/models/storage/database")(sequelize),
        /** Oauth models */
        OAuthAccessToken: require("../artifacts/user/models/oauth/accessToken")(sequelize),
        OAuthRefreshToken: require("../artifacts/user/models/oauth/refreshToken")(sequelize),
        OAuthAuthorizationCode: require("../artifacts/user/models/oauth/authorizationCode")(sequelize),
        OAuthClient: require("../artifacts/user/models/oauth/client")(sequelize),
        /** User models */
        User: require("../artifacts/user/models/user")(sequelize)
    }

    for (const name in models) {
        if ("associate" in models[name]) {
            models[name].associate(models)
        }
    }

    debug("models relation linked");

    return sequelize;
};

