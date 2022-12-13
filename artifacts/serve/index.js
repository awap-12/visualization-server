const express = require("express");
const compression = require("compression");
const path = require("node:path");
const chartRoute = require("./routes/chart");

const { NODE_ENV } = process.env;

const isDev = NODE_ENV === "development";

function server(port) {
    const app = new express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(compression());

    app.use("/", (req, res) => res.sendFile(path.resolve(__dirname, "view/index.html")));

    app.use("/chart", chartRoute);

    // static folder mapping.
    app.use("/static", express.static(path.resolve(__dirname, "static")));

    app.listen(port);
}

function development(port) {
    const { dialect, pool, ...databaseConfig } = require("../../config/database");
    const sequelize = require("./handles/model");
    const inject = require("./utils/inject");
    const mysql = require("mysql2");

    const connection = mysql.createConnection({ ...databaseConfig, database: "information_schema" });

    connection.query(`create schema if not exists ${databaseConfig.database}`, err => {
        if (!!err) process.exit(err.errno);
        sequelize.sync({ force: true }).then(() => {
            inject().then(() => server(port));
        });
    });
}

function production(port) {
    const cluster = require("node:cluster");

    if (cluster.isSpawn) {
        cluster.onEvent("syncDatabaseReady", () => {
            server(port);
        });
    }
}

module.exports = isDev ? development(3000) : production;
module.exports.server = server;
