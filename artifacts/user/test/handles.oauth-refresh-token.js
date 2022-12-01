const assert = require("node:assert");
const sequelize = require("../handles/model");
const OAuthRefreshToken = require("../handles/oauth/refreshToken");
const crypto = require("node:crypto");

const { OAuthClient, User } = sequelize.models;

describe("oauth refresh token handle test", () => {
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
    it("should save refresh token", async () => {
        const result = await OAuthRefreshToken.saveRefreshToken(
            { refreshToken: "zxcvbnm", refreshTokenExpiresAt: new Date(null) },
            { id: "test-client-id-0" },
            { id: 1 });
        assert.deepStrictEqual(result.get(), {
            id: 1,
            refreshToken: "zxcvbnm",
            refreshTokenExpiresAt: new Date(null),
            scope: '',
            clientId: "test-client-id-0",
            userId: 1
        });
    });
    it("should get refresh token", async () => {
        const result = await OAuthRefreshToken.getRefreshToken("zxcvbnm");
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
            refreshTokenExpiresAt: new Date(null),
            scope: ''
        });
    });
});
