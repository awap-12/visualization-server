const request = require("supertest");
const sequelize = require("../handles/model");
const Koa = require("koa");
const view = require("koa-view");
const bodyParser = require("koa-bodyparser");
const userRouter = require("../routes/user");
const path = require("node:path");

describe("user route test", () => {
    const app = new Koa();

    app.use(bodyParser());
    app.use(view(path.resolve(__dirname, "../view"), { map: { html: "nunjucks" }}));
    app.use(userRouter.routes()).use(userRouter.allowedMethods());

    const agent = request.agent(app.listen());
    before("database create", async () => await sequelize.sync({ force: true }));
    after("database clean", async () => sequelize.drop());
    describe("GET /", () => {
        it("should render a html", done => {
            agent
                .get("/?test")
                .expect(200, done);
        });
    });
    describe("POST /", () => {
        it("should register a `test` user", done => {
            agent
                .post("/")
                .send({
                    name: "test-name",
                    password: "test-password"
                })
                .expect(200, done);
        });
        it("should return error when password is wrong", done => {
            agent
                .post("/")
                .send({
                    name: "test-name",
                    password: "wrong-password"
                })
                .expect(500, done);
        });
    });
    describe("PUT /", () => {
        it("should replace password", done => {
            agent
                .put("/")
                .send({
                    name: "test-name",
                    password: "new-test-password"
                })
                .expect(200, done);
        });
    });
});
