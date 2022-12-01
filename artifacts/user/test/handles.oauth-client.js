const assert = require("node:assert");
const sequelize = require("../handles/model");
const clientHandle = require("../handles/oauth/client");

describe("oauth client handle test", () => {
    before("database create", async () => sequelize.sync({ force: true }));
    after("database clean", async () => sequelize.drop());
    it("should save client 'test'", async () => {
        const result = await clientHandle.saveClient("test-id", "test-secret", "http://localhost:3000/cb", ["a", "b"]);
        assert.deepStrictEqual(result.get(), {
            id: "test-id",
            secret: "test-secret",
            grants: ["a", "b"],
            redirectUris: ["http://localhost:3000/cb"],
            scope: ''
        });
    });
    it("should get client 'test'", async () => {
        const result = await clientHandle.getClient("test-id", "test-secret");
        assert.deepStrictEqual(result.get(), {
            id: "test-id",
            grants: ["a", "b"],
            redirectUris: ["http://localhost:3000/cb"],
            scope: ''
        });
    });
});
