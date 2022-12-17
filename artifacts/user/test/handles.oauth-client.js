const clientHandle = require("../handles/oauth/client.js");
const sequelize = require("../handles/model.js");
const assert = require("node:assert");

describe("oauth client handle test", () => {
    const globalClient = {
        id: "test-client-id",
        secret: "test-client-secret",
        redirectUris: "http://localhost/cb",
        grants: ["a", "b"]
    };
    before("database create", async () => sequelize.sync({ force: true }));
    after("database clean", async () => sequelize.drop());
    describe("saveClient test", () => {
        it(`should save client ${globalClient.id}`, async () => {
            const result = await clientHandle.saveClient(globalClient.id, globalClient.secret, globalClient.redirectUris, globalClient.grants);
            assert.deepStrictEqual(result.get(), {
                id: globalClient.id,
                secret: globalClient.secret,
                grants: globalClient.grants,
                redirectUris: [globalClient.redirectUris],
                scope: ''
            });
        });
        it("should save client with generate id", async () => {
            const result = await clientHandle.saveClient(undefined, globalClient.secret, globalClient.redirectUris, globalClient.grants);
            assert.deepStrictEqual(result.id.length, 16);
        });
    });
    describe("getClient test", () => {
        it(`should get client ${globalClient.id}`, async () => {
            const result = await clientHandle.getClient(globalClient.id, globalClient.secret);
            assert.deepStrictEqual(result.get(), {
                id: globalClient.id,
                grants: globalClient.grants,
                redirectUris: [globalClient.redirectUris],
                scope: ''
            });
        });
    });
});
