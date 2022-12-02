const assert = require("node:assert");
const sequelize = require("../handles/model");
const OAuthRefreshToken = require("../handles/oauth/refreshToken");
const crypto = require("node:crypto");

const { OAuthClient, User } = sequelize.models;

describe("oauth refresh token handle test", () => {
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
        await User.bulkCreate([globalUser]);
        await OAuthClient.bulkCreate([globalClient]);
    });
    after("database clean", async () => sequelize.drop());
    it(`should save refresh token ${globalToken}`, async () => {
        const result = await OAuthRefreshToken.saveRefreshToken(
            { refreshToken: globalToken, refreshTokenExpiresAt: new Date(null) },
            { id: globalClient.id },
            { id: 1 });
        assert.deepStrictEqual(result.get(), {
            id: 1,
            refreshToken: globalToken,
            refreshTokenExpiresAt: new Date(null),
            scope: '',
            clientId: globalClient.id,
            userId: 1
        });
    });
    it(`should get refresh token ${globalToken}`, async () => {
        const result = await OAuthRefreshToken.getRefreshToken(globalToken);
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
            refreshTokenExpiresAt: new Date(null),
            scope: ''
        });
    });
});
