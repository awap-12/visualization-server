const Koa = require("koa");
const json = require("koa-json");
const logger = require("koa-logger");
const cluster = require("node:cluster");
const mysql = require("mysql2");
const databaseConfig = require("../../config/database");

const { NODE_ENV } = process.env;

const isDev = NODE_ENV === "development";
const { host, user, password, database } = databaseConfig;

function start(port) {
    const connection = mysql.createConnection({ host, user, password, database: "information_schema" });
    connection.query(`create schema if not exists ${database}`, err => {
        if (!!err) process.exit(err.errno);
        sequelize.sync({ force: true }).then(() => {
            const app = new Koa();

            app.use(json());
            app.use(logger());

            //app.use(oauthRouter.routes());

            app.listen(port);
        });
    });
}

module.exports = isDev ? start(3000) : port => {
    if (cluster.isSpawn) {
        start(port);
    }
}
