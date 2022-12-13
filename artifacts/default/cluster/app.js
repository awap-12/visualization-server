const debug = require("debug")("server");
const config = require("../handles/worker.js");
const thread = require("../utils/thread.js")(__filename);
const cluster = require("node:cluster");

if (cluster.isMain) {
    const mysql = require("mysql2");

    const { dialect, pool, ...databaseConfig }  = require("../../../config/database");
    const instance = require("../../../handles/model");

    const connection = mysql.createConnection({ ...databaseConfig, database: "information_schema" });

    connection.query(`create schema if not exists ${databaseConfig.database}`, err => {
        if (!!err) process.exit(err.errno);
        instance.sync({ force: true }).then(() => {
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
