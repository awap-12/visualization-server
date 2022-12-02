const assert = require("node:assert");
const sequelize = require("../handles/model");
const codeHandle = require("../handles/oauth/authorizationCode");
const crypto = require("node:crypto");

const { OAuthClient, User } = sequelize.models;

describe("oauth code handle test", () => {
    const globalCode = "test-code";
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
    it(`should save code ${globalCode}`, async () => {
        const result = await codeHandle.saveAuthorizationCode({
            authorizationCode: globalCode,
            expiresAt: new Date(null),
            redirectUri: "http://localhost:3000"
        }, { id: globalClient.id }, { id: 1 });
        assert.deepStrictEqual(result.get(), {
            id: 1,
            code: globalCode,
            expires: new Date(null),
            redirectUri: "http://localhost:3000",
            scope: '',
            clientId: globalClient.id,
            userId: 1,
        });
    });
    it(`should get code ${globalCode}`, async () => {
        const result = await codeHandle.getAuthorizationCode(globalCode);
        const hashPassword = crypto.createHash("md5").update(globalUser.name + globalUser.password).digest("hex");
        const { user: UserTable, client: OAuthClientTable } = result;
        assert.deepStrictEqual({ ...result.get(), user: UserTable.get(), client: OAuthClientTable.get() }, {
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
            expires: new Date(null),
            scope: ''
        });
    });
});
