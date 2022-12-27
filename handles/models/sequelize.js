const debug = require("debug")("handle:sequelize");
const databaseConfig  = require("../../config/database.js");
const serviceConfig = require("../../config/service.js");
const highlight = require("../../utils/sql.js");
const { Sequelize } = require("sequelize");

const { NODE_ENV: nodeEnv } = process.env;

const isDev = nodeEnv === "development";

const sequelize = new Sequelize(databaseConfig.database, databaseConfig.user, databaseConfig.password, {
    logging: sql => isDev ? debug(highlight(sql)) : false,
    host: databaseConfig.host,
    port: databaseConfig.port,
    dialect: databaseConfig.dialect,
    dialectOptions: {
        socketPath: databaseConfig.socketPath
    }
});

/**
 * Make association for all models.
 * Under development case we register always.
 * Under production case we have to register by code.
 * @param {object} models
 * @param {boolean} associate
 * @return {Sequelize}
 */
function registerModels({ models = sequelize.models, associate = isDev } = {}) {
    if (associate)
        for (const name in models) {
            if ("associate" in models[name]) {
                models[name].associate(models)
            }
        }

    return sequelize;
}

module.exports = sequelize;
module.exports.registerModels = registerModels;
