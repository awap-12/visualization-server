const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
const serve = require("koa-static");
const view = require("koa-view");
const path = require("node:path");

const oauthRouter = require("./routes/oauth");
const userRouter = require("./routes/user");

const app = new Koa();

app.use(logger());
app.use(bodyParser());

app.use(view(path.resolve(__dirname, "view"), { map: { html: "nunjucks" }}));
app.use(serve(path.resolve(__dirname, "static")));

app.use(userRouter.routes()).use(userRouter.allowedMethods());
app.use(oauthRouter.routes()).use(oauthRouter.allowedMethods());

module.exports = app.callback();
