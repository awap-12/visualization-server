const sequelize = require("../handles/model");
const fileHandle = require("../handles/file");
const assert = require("node:assert");
const fs = require("node:fs/promises");
const path = require("node:path");

describe("file handle test", () => {
    const globalFile = {
        name: "test-file",
        info: "test-info",
        path: "/fixtures/foo.bar",
        size: 1024
    }
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await fs.writeFile(path.resolve(__dirname, "fixtures/foo.bar"), '');
    });
    after("database clean", async () => sequelize.drop());
    describe("saveFile test", () => {
        it("should save a file", async () => {
            const result = await fileHandle.saveFile(globalFile.path, globalFile.name, 0, "random");

            const { createdAt, updatedAt, ...other } = result.get();

            assert.deepStrictEqual(other, {
                name: globalFile.name,
                info: "random",
                path: globalFile.path,
                size: 0
            });
        });
        it("should update file and return update file result", async () => {
            const result = await fileHandle.saveFile(globalFile.path, globalFile.name, globalFile.size, globalFile.info);

            assert.strictEqual(result, true);
        })
    });
    describe("getFileById test", () => {
        it("should get a file", async () => {
            const result = await fileHandle.getFileByPath(globalFile.path);

            const { createdAt, updatedAt, ...other } = result.get();

            assert.deepStrictEqual(other, {
                name: globalFile.name,
                info: globalFile.info,
                path: globalFile.path,
                size: globalFile.size
            });
        });
        it("should return false", async () => {
            const result = await fileHandle.getFileByPath("unknown-path");

            assert.strictEqual(result, false);
        });
    });
    describe("updateFile test", () => {
        it("should update name and info", async () => {
            const result = await fileHandle.updateFile(globalFile.path, {
                name: "new-name",
                info: "new-info"
            });

            assert.strictEqual(result, true);
        });
        it("should not update", async () => {
            const result = await fileHandle.updateFile(globalFile.path, { unknown: "unknown" });

            assert.strictEqual(result, false);
        });
    });
    describe("deleteFile test", () => {
        it(`should return true and remove row`, async () => {
            const result = await fileHandle.deleteFile(globalFile.path);

            assert.strictEqual(result, true);
        });
        it("should return false with a fail operation", async () => {
            const result = await fileHandle.deleteFile("foobar");

            assert.strictEqual(result, false);
        });
    });
});
