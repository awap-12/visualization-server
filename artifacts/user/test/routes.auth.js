const request = require("supertest");
const Koa = require("koa");
const view = require("koa-view");
const bodyParser = require("koa-bodyparser");
const authRouter = require("../routes/auth");
const path = require("node:path");

describe("auth route test", () => {
    const app = new Koa();

    app.use(bodyParser());
    app.use(view(path.resolve(__dirname, "../views"), { map: { html: "nunjucks" }}));
    app.use(authRouter.routes()).use(authRouter.allowedMethods());

    const agent = request.agent(app.listen());
    describe("GET /", () => {
        it("should render a html", done => {
            agent
                .get("/auth?test")
                .expect(200, done);
        });
    });
});
