const debug = require("debug")("server");
const thread = require("./thread.js")(__filename);
const cluster = require("node:cluster");
const config = require("./config/server");

if (cluster.isMain) {
    const mysql = require("mysql2");

    const databaseConfig  = require("./config/database");
    const modelConfig = require("./config/model");
    const sequelize = require("./handles/model");

    const { host, user, password, database } = databaseConfig;

    const connection = mysql.createConnection({ host, user, password, database: "information_schema" });

    connection.query(`create schema if not exists ${database}`, err => {
        if (!!err) process.exit(err.errno);
        sequelize.sync({ force: true }).then(() => {
            // build relation
            modelConfig(sequelize);
            // broadcast event
            cluster.sendEvent("syncDatabaseReady");
        });
    });

    cluster.onEvent(thread.EV_ERROR, (ev, error) => {
        debug("error event received %s", error);
        process.exit();
    });
}

thread.start(config.workers);
