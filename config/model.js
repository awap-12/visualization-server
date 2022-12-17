const debug = require("debug")("config:model");

module.exports = sequelize => {
    const models = {
        /** Serve models */
        Chart: require("serve/models/chart")(sequelize),
        File: require("serve/models/file")(sequelize),
        Local: require("serve/models/storage/local")(sequelize),
        Database: require("serve/models/storage/database")(sequelize),
        /** Page models */
        Preview: require("page/models/preview")(sequelize),
        View: require("page/models/view")(sequelize),
        /** Oauth models */
        OAuthAccessToken: require("user/models/oauth/accessToken")(sequelize),
        OAuthRefreshToken: require("user/models/oauth/refreshToken")(sequelize),
        OAuthAuthorizationCode: require("user/models/oauth/authorizationCode")(sequelize),
        OAuthClient: require("user/models/oauth/client")(sequelize),
        /** User models */
        User: require("user/models/user")(sequelize)
    }

    for (const name in models) {
        if ("associate" in models[name]) {
            models[name].associate(models)
        }
    }

    debug("models relation linked");

    return sequelize;
};

