const { sequelize } = require("server/handles/models");

const { NODE_ENV: nodeEnv } = process.env;

const productionModels = {
    /** Oauth models */
    OAuthAccessToken: require("../models/oauth/accessToken.js")(sequelize),
    OAuthRefreshToken: require("../models/oauth/refreshToken.js")(sequelize),
    OAuthAuthorizationCode: require("../models/oauth/authorizationCode.js")(sequelize),
    OAuthClient: require("../models/oauth/client.js")(sequelize),
    /** User models */
    User: require("../models/user.js")(sequelize)
};

const developmentModels = {
    /** Oauth & User models */
    ...productionModels
};

module.exports = sequelize.registerModels({
    models: {
        production: productionModels,
        development: developmentModels
    }[nodeEnv]
});
