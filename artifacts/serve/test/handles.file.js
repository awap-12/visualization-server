const sequelize = require("../handles/model");
const fileHandle = require("../handles/file");
const assert = require("node:assert");
const fs = require("node:fs/promises");
const path = require("node:path");

describe("file handle test", () => {
    const globalFile = {
        name: "test-file",
        info: "test-info",
        url: "/fixtures/foo.bar",
        size: 1024
    };
    const globalD3Dsv = [
        { time: "test-time-01", value: "test-value-01" },
        { time: "test-time-02", value: "test-value-02" },
        { time: "test-time-03", value: "test-value-03" },
        { time: "test-time-04", value: "test-value-04" }
    ];
    globalD3Dsv.columns = ["time", "value"];
    before("database create", async () => await sequelize.sync({ force: true }));
    after("database clean", async () => sequelize.drop());
    describe("saveFile test", () => {
        it("should save a file", async () => {
            const result = await fileHandle.saveFile(globalFile.url, globalFile.name, 0, "random");

            const { createdAt, updatedAt, ...other } = result.get();

            assert.deepStrictEqual(other, {
                name: globalFile.name,
                info: "random",
                url: globalFile.url,
                size: 0
            });
        });
        it("should update file (with force option) and return update file result", async () => {
            const result = await fileHandle.saveFile(globalFile.url, globalFile.name, globalFile.size, globalFile.info, true);

            assert.strictEqual(result, true);
        })
    });
    describe("getFileById test", () => {
        it("should get a file", async () => {
            const result = await fileHandle.getFileByUrl(globalFile.url);

            const { createdAt, updatedAt, ...other } = result.get();

            assert.deepStrictEqual(other, {
                name: globalFile.name,
                info: globalFile.info,
                url: globalFile.url,
                size: globalFile.size
            });
        });
        it("should return false", async () => {
            const result = await fileHandle.getFileByUrl("unknown-url");

            assert.strictEqual(result, false);
        });
    });
    describe("updateFile test", () => {
        it("should update name and info", async () => {
            const result = await fileHandle.updateFile(globalFile.url, {
                name: "new-name",
                info: "new-info"
            });

            assert.strictEqual(result, true);
        });
        it("should not update", async () => {
            const result = await fileHandle.updateFile(globalFile.url, { unknown: "unknown" });

            assert.strictEqual(result, false);
        });
    });
    describe("deleteFile test", () => {
        it(`should return true and remove row`, async () => {
            const result = await fileHandle.deleteFile(globalFile.url);

            assert.strictEqual(result, true);
        });
        it("should return false with a fail operation", async () => {
            const result = await fileHandle.deleteFile("foobar");

            assert.strictEqual(result, false);
        });
    });
});
