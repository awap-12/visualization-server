const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
const serve = require("koa-static");
const view = require("koa-view");
const path = require("node:path");

const authMiddleware = require("./middleware/jwt");//require("./middleware/auth");

const oauthRouter = require("./routes/oauth.js");
const authRouter = require("./routes/auth.js");
const userRouter = require("./routes/user.js");

const app = new Koa();

app.use(logger());
app.use(bodyParser());

app.use(view(path.resolve(__dirname, "views"), { map: { html: "nunjucks" }}));
app.use(serve(path.resolve(__dirname, "static")));

app.use(oauthRouter.routes()).use(oauthRouter.allowedMethods());
app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(userRouter.routes()).use(userRouter.allowedMethods());

module.exports = app.callback();

/**
 * Authenticate middleware
 * @param options
 */
module.exports.auth = authMiddleware;
