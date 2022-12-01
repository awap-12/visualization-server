const assert = require("node:assert");
const sequelize = require("../handles/model");
const codeHandle = require("../handles/oauth/authorizationCode");
const crypto = require("node:crypto");
const {user} = require("../../../config/database");

const { OAuthClient, User } = sequelize.models;

describe("oauth code handle test", () => {
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
    it("should save code 'test'", async () => {
        const result = await codeHandle.saveAuthorizationCode({
            authorizationCode: "test-code",
            expiresAt: new Date(null),
            redirectUri: "http://localhost:3000"
        }, { id: "test-client-id-0" }, { id: 1 });
        assert.deepStrictEqual(result.get(), {
            id: 1,
            code: "test-code",
            expires: new Date(null),
            redirectUri: "http://localhost:3000",
            scope: '',
            clientId: "test-client-id-0",
            userId: 1,
        });
    });
    it("should get code 'test'", async () => {
        const result = await codeHandle.getAuthorizationCode("test-code");
        const hashPassword = crypto.createHash("md5").update("test-name-0" + "test-password-0").digest("hex");
        const { user: UserTable, client: OAuthClientTable } = result;
        assert.deepStrictEqual({ ...result.get(), user: UserTable.get(), client: OAuthClientTable.get() }, {
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
            expires: new Date(null),
            scope: ''
        });
    });
});
