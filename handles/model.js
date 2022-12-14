const debug = require("debug")("handle:model");
const databaseConfig  = require("../config/database");
const modelConfig = require("../config/model");
const highlight = require("../utils/sql");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(databaseConfig.database, databaseConfig.user, databaseConfig.password, {
    host: databaseConfig.host,
    port: databaseConfig.port,
    dialect: databaseConfig.dialect,
    dialectOptions: {
        socketPath: databaseConfig.socketPath
    },
    logging: sql => debug(highlight(sql)),
    pool: {
        max: databaseConfig.pool.max,
        min: databaseConfig.pool.min,
        acquire: databaseConfig.pool.acquire,
        idle: databaseConfig.pool.idle
    }
});

module.exports = modelConfig(sequelize);
