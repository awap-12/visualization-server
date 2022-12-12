const debug = require("debug")("handle:model");

const { NODE_ENV } = process.env;

const isDev = NODE_ENV === "development";

function development() {
    const { Sequelize } = require("sequelize");

    const config = require("../../../config/database");
    const highlight = require("../../../utils/sql")

    const sequelize = new Sequelize(config.database, config.user, config.password, {
        host: config.host,
        port: config.port,
        dialect: config.dialect,
        dialectOptions: {
            socketPath: config.socketPath
        },
        logging: sql => debug(highlight(sql)),
        pool: {
            max: config.pool.max,
            min: config.pool.min,
            acquire: config.pool.acquire,
            idle: config.pool.idle
        }
    });

    const models = {
        /** Oauth models */
        OAuthAccessToken: require("../models/oauth/accessToken")(sequelize),
        OAuthRefreshToken: require("../models/oauth/refreshToken")(sequelize),
        OAuthAuthorizationCode: require("../models/oauth/authorizationCode")(sequelize),
        OAuthClient: require("../models/oauth/client")(sequelize),
        /** User models */
        User: require("../models/user")(sequelize)
    }

    for (const name in models) {
        if ("associate" in models[name]) {
            models[name].associate(models)
        }
    }

    return sequelize;
}

module.exports = isDev ? development() : require("../../../handles/model");
