const request = require("supertest");
const sequelize = require("../handles/model");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const oauthRouter = require("../routes/oauth");
const assert = require("node:assert");

const { OAuthAccessToken, OAuthClient, User } = sequelize.models;

describe("oauth route test", () => {
    const app = new Koa();

    app.use(bodyParser());
    app.use(oauthRouter.routes()).use(oauthRouter.allowedMethods());

    const agent = request.agent(app.listen(3000));
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.bulkCreate([{ name: "test-name", password: "test-password" }]);
        await OAuthClient.bulkCreate([{
            id: "test-client",
            secret: "test-client-secret",
            redirectUris: "http://localhost/cb",
            grants: ["authorization_code"]
        }]);
        await OAuthAccessToken.bulkCreate([{
            accessToken: "test-token",
            accessTokenExpiresAt: new Date(9999, 9, 9, 9, 9, 9),
            clientId: "test-client",
            userId: 1
        }]);
    });
    after("database clean", async () => sequelize.drop());
    it("should get a authorize code", done => {
        agent
            .post("/oauth/authorize?" +
                "response_type=code&" +
                "client_id=test-client&" +
                "state=test&" +
                "redirect_uri=http://localhost/cb&" +
                "access_token=test-token")
            .expect(302)
            .end((err, res) => {
                if (err) return done(err);
                assert.ok("headers" in res);
                assert.ok("location" in res.headers);
                done();
            });
    });
});
