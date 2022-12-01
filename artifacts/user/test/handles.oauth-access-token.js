const assert = require("node:assert");
const sequelize = require("../handles/model");
const OAuthAccessToken = require("../handles/oauth/accessToken");
const crypto = require("node:crypto");

const { OAuthClient, User } = sequelize.models;

describe("oauth access token handle test", () => {
    before("database create", async () => {
        await sequelize.sync({ force: true });
        let userSet = [], clientSet = [];
        for (let i = 0; i < 10; i++) {
            userSet[i] = { name: `test-name-${i}`, password: `test-password-${i}` };
            clientSet[i] = {
                id: `test-client-id-${i}`,
                secret: `test-client-secret-${i}`,
                redirectUris: "http://localhost/cb",
                grants: ["test-grant"],
                userId: i + 1
            };
        }
        await User.bulkCreate(userSet);
        await OAuthClient.bulkCreate(clientSet);
    });
    after("database clean", async () => sequelize.drop());
    it("should save access token", async () => {
        const result = await OAuthAccessToken.saveAccessToken(
            { accessToken: "zxcvbnm", accessTokenExpiresAt: new Date(null) },
            { id: "test-client-id-0" },
            { id: 1 });
        assert.deepStrictEqual(result.get(), {
            id: 1,
            accessToken: "zxcvbnm",
            accessTokenExpiresAt: new Date(null),
            scope: '',
            clientId: "test-client-id-0",
            userId: 1
        });
    });
    it("should get access token", async () => {
        const result = await OAuthAccessToken.getAccessToken("zxcvbnm");
        const hashPassword = crypto.createHash("md5").update("test-name-0" + "test-password-0").digest("hex");
        const { user: UserTable, client: OAuthClientTable } = result;
        assert.deepStrictEqual(Object.assign(result.get(), { user: UserTable.get(), client: OAuthClientTable.get() }), {
            client: {
                id: "test-client-id-0",
                secret: "test-client-secret-0",
                grants: ["test-grant"],
                redirectUris: ["http://localhost/cb"],
                scope: ''
            },
            user: {
                id: 1,
                name: "test-name-0",
                password: hashPassword,
                scope: ''
            },
            accessToken: "zxcvbnm",
            accessTokenExpiresAt: new Date(null),
            scope: ''
        });
    });
});
