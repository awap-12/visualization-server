const debug = require("debug")("config:model");

module.exports = sequelize => {
    const models = {
        /** Serve models */
        Chart: require("serve/models/chart.js")(sequelize),
        File: require("serve/models/file.js")(sequelize),
        Local: require("serve/models/storage/local.js")(sequelize),
        Database: require("serve/models/storage/database.js")(sequelize),
        /** Page models */
        Preview: require("page/models/preview.js")(sequelize),
        View: require("page/models/view.js")(sequelize),
        /** Oauth models */
        OAuthAccessToken: require("user/models/oauth/accessToken.js")(sequelize),
        OAuthRefreshToken: require("user/models/oauth/refreshToken.js")(sequelize),
        OAuthAuthorizationCode: require("user/models/oauth/authorizationCode.js")(sequelize),
        OAuthClient: require("user/models/oauth/client.js")(sequelize),
        /** User models */
        User: require("user/models/user.js")(sequelize)
    }

    for (const name in models) {
        if ("associate" in models[name]) {
            models[name].associate(models)
        }
    }

    debug("models relation linked");

    return sequelize;
};

