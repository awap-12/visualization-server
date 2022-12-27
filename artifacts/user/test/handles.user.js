const userHandle = require("../handles/user.js");
const sequelize = require("../handles/model.js");
const crypto = require("node:crypto");
const assert = require("node:assert");

describe("user handle test", () => {
    const globalUser = { name: `test-name`, password: `test-password` };
    before("database create", async () => sequelize.sync({ force: true }));
    after("database clean", async () => sequelize.drop());
    describe("saveUser test", () => {
        it(`should save user ${globalUser.name}`, async () => {
            const result = await userHandle.saveUser(globalUser.name, globalUser.password);
            const hashPassword = crypto.createHash("md5").update(globalUser.name + globalUser.password).digest("hex");
            assert.deepStrictEqual(result.get(), {
                id: 1,
                name: globalUser.name,
                password: hashPassword,
                scope: ''
            });
        });
    });
    describe("trySaveUser test", () => {
        it(`should reject if try to save ${globalUser.name} again`, async () => {
            const result = await userHandle.trySaveUser(globalUser.name, "wrong");
            assert.strictEqual(result, false);
        });
        it(`should accept if try to save different from ${globalUser.name}`, async () => {
            const result = await userHandle.trySaveUser("foo", "bar");
            const hashPassword = crypto.createHash("md5").update("foo" + "bar").digest("hex");
            assert.deepStrictEqual(result.get(), {
                id: 2,
                name: "foo",
                password: hashPassword,
                scope: ''
            });
        });
    });
    describe("getUser test", () => {
        it(`should get user ${globalUser.name}`, async () => {
            const result = await userHandle.getUser(globalUser.name, globalUser.password);
            assert.deepStrictEqual(result.get(), {
                id: 1,
                name: globalUser.name,
                scope: ''
            });
        });
    });
    describe("updateUser test", () => {
        it(`should update ${globalUser.name}'s password`, async () => {
            const result = await userHandle.updateUser(globalUser.name, { password: `new-${globalUser.password}` });
            assert.deepStrictEqual(result, true);
        });
        it("should not update anything with unknown user", async () => {
            const result = await userHandle.updateUser("bar", { password: `new-${globalUser.password}` });
            assert.deepStrictEqual(result, false);
        });
    });
    describe("deleteUser test", () => {
        it(`should remove user ${globalUser.name}`, async () => {
            const result = await userHandle.deleteUser(1);
            assert.strictEqual(result, true);
        });
        it("should not remove anything with unknown user", async () => {
           const result = await userHandle.deleteUser(1024);
           assert.strictEqual(result, false);
        });
    });
});
