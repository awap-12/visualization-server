const sequelize = require("server/handles/model.js");

const { NODE_ENV: nodeEnv } = process.env;

const isDev = nodeEnv === "development";

function development({ sequelize }) {

    const models = {
        /** Oauth models */
        OAuthAccessToken: require("../models/oauth/accessToken.js")(sequelize),
        OAuthRefreshToken: require("../models/oauth/refreshToken.js")(sequelize),
        OAuthAuthorizationCode: require("../models/oauth/authorizationCode.js")(sequelize),
        OAuthClient: require("../models/oauth/client.js")(sequelize),
        /** User models */
        User: require("../models/user.js")(sequelize)
    }

    for (const name in models) {
        if ("associate" in models[name]) {
            models[name].associate(models)
        }
    }

    return sequelize;
}

/** @type Sequelize */
module.exports = isDev ? development(sequelize): sequelize;
