const request = require("supertest");
const sequelize = require("../handles/model");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const clientRouter = require("../routes/client");

describe("client route test", () => {
    const app = new Koa();

    app.use(bodyParser());
    app.use(clientRouter.routes()).use(clientRouter.allowedMethods());

    const agent = request.agent(app.listen());
    before("database create", async () => await sequelize.sync({ force: true }));
    after("database clean", async () => sequelize.drop());
    describe("POST /", () => {
        it("should create a client", done => {
            agent
                .post("/client")
                .send({
                    id: "test-client",
                    secret: "test-client-secret",
                    redirectUris: "http://localhost/cb",
                    grants: ["a", "b"]
                })
                .expect(200, done);
        });
    });
});
