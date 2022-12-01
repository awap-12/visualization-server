const assert = require("node:assert");
const crypto = require("node:crypto");
const sequelize = require("../handles/model");
const userHandle = require("../handles/user");

describe("user handle test", () => {
    before("database create", async () => sequelize.sync({ force: true }));
    after("database clean", async () => sequelize.drop());
    it("should save user 'test'", async () => {
        const result = await userHandle.saveUser("test", "test");
        const hashPassword = crypto.createHash("md5").update("test" + "test").digest("hex");
        assert.deepStrictEqual(result.get(), {
            id: 1,
            name: "test",
            password: hashPassword,
            scope: ''
        });
    });
    it("should reject if try to save 'test' again", async () => {
        const result = await userHandle.trySaveUser("test", "0");
        assert.strictEqual(result, false);
    });
    it("should accept if try to save different from 'test'", async () => {
       const result = await userHandle.trySaveUser("foo", "bar");
        const hashPassword = crypto.createHash("md5").update("foo" + "bar").digest("hex");
       assert.deepStrictEqual(result.get(), {
           id: 2,
           name: "foo",
           password: hashPassword,
           scope: ''
       });
    });
    it("should get user 'test'", async () => {
        const result = await userHandle.getUser("test", "test");
        assert.deepStrictEqual(result.get(), {
            id: 1,
            name: "test",
            scope: ''
        });
    });
    it("should remove user 'test'", async () => {
        const result = await userHandle.deleteUser("test");
        assert.strictEqual(result, 1);
    });
});
