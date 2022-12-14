const OAuthAccessTokenHandle = require("../handles/oauth/accessToken.js");
const sequelize = require("../handles/model.js");
const crypto = require("node:crypto");
const assert = require("node:assert");

const { OAuthClient, User } = sequelize.models;

describe("oauth access token handle test", () => {
    const globalToken = "zxcvbnm";
    const globalUser = { name: `test-name`, password: `test-password` };
    const globalClient = {
        id: "test-client-id",
        secret: "test-client-secret",
        redirectUris: "http://localhost/cb",
        grants: ["test-grant"]
    };
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.create(globalUser);
        await OAuthClient.create(globalClient);
    });
    after("database clean", async () => sequelize.drop());
    describe("saveAccessToken test", () => {
        it(`should save access token ${globalToken}`, async () => {
            const result = await OAuthAccessTokenHandle.saveAccessToken(
                { accessToken: globalToken, accessTokenExpiresAt: new Date(null) },
                { id: globalClient.id },
                { id: 1 });
            assert.deepStrictEqual(result.get(), {
                id: 1,
                accessToken: globalToken,
                accessTokenExpiresAt: new Date(null),
                scope: '',
                clientId: globalClient.id,
                userId: 1
            });
        });
    });
    describe("getAccessToken test", () => {
        it(`should get access token ${globalToken}`, async () => {
            const result = await OAuthAccessTokenHandle.getAccessToken(globalToken);
            const hashPassword = crypto.createHash("md5").update(globalUser.name + globalUser.password).digest("hex");
            const { user: UserTable, client: OAuthClientTable } = result;
            assert.deepStrictEqual(Object.assign(result.get(), { user: UserTable.get(), client: OAuthClientTable.get() }), {
                client: {
                    id: globalClient.id,
                    secret: globalClient.secret,
                    grants: globalClient.grants,
                    redirectUris: [globalClient.redirectUris],
                    scope: ''
                },
                user: {
                    id: 1,
                    name: globalUser.name,
                    password: hashPassword,
                    scope: ''
                },
                accessToken: globalToken,
                accessTokenExpiresAt: new Date(null),
                scope: ''
            });
        });
    });
});
