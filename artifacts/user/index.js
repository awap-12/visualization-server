const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
const serve = require("koa-static");
const view = require("koa-view");
const path = require("node:path");
const oauthRouter = require("./routes/oauth");
const userRouter = require("./routes/user");

const { NODE_ENV } = process.env;

const isDev = NODE_ENV === "development";

function server(port) {
    const app = new Koa();

    app.use(logger());
    app.use(bodyParser());

    app.use(view(path.resolve(__dirname, "view"), { map: { html: "nunjucks" }}));
    app.use(serve(path.resolve(__dirname, "static")));

    app.use(userRouter.routes()).use(userRouter.allowedMethods());
    app.use(oauthRouter.routes()).use(oauthRouter.allowedMethods());

    app.listen(port);
}

function development(port) {
    const databaseConfig = require("../../config/database");
    const sequelize = require("./handles/model");
    const mysql = require("mysql2");

    const { host, user, password, database } = databaseConfig;

    const connection = mysql.createConnection({ host, user, password, database: "information_schema" });

    connection.query(`create schema if not exists ${database}`, err => {
        if (!!err) process.exit(err.errno);
        sequelize.sync({ force: true }).then(() => server(port));
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
