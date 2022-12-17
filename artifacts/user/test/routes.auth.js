const request = require("supertest");
const sequelize = require("../handles/model");
const Koa = require("koa");
const view = require("koa-view");
const bodyParser = require("koa-bodyparser");
const authRouter = require("../routes/auth");
const path = require("node:path");

describe("user route test", () => {
    const app = new Koa();

    app.use(bodyParser());
    app.use(view(path.resolve(__dirname, "../views"), { map: { html: "nunjucks" }}));
    app.use(authRouter.routes()).use(authRouter.allowedMethods());

    const agent = request.agent(app.listen());
    before("database create", async () => await sequelize.sync({ force: true }));
    after("database clean", async () => sequelize.drop());
    describe("GET /", () => {
        it("should render a html", done => {
            agent
                .get("/auth?test")
                .expect(200, done);
        });
    });
});
