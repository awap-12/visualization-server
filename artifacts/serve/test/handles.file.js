const sequelize = require("../handles/model");
const fileHandle = require("../handles/file");
const assert = require("node:assert");
const fs = require("node:fs/promises");
const path = require("node:path");

describe("file handle test", () => {
    const globalFile = [
        {
            url: "test/fixtures/test-01",
            name: "test-file-01",
            info: "test-info-01",
            owner: "test-owner-01"
        }, {
            url: "test/fixtures/test-02",
            name: "test-file-02",
            strategy: "database",
            info: "test-info-02",
            owner: "test-owner-02"
        }
    ];
    const globalD3Dsv = [
        { time: "test-time-01", value: "test-value-01" },
        { time: "test-time-02", value: "test-value-02" },
        { time: "test-time-03", value: "test-value-03" },
        { time: "test-time-04", value: "test-value-04" }
    ];
    globalD3Dsv.columns = ["time", "value"];
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await Promise.all(globalFile.map(async ({ url }) => {
            await fs.writeFile(path.resolve(__dirname, "..", url), '');
        }));
    });
    after("database clean", async () => {
        await Promise.all(globalFile.map(async ({ url }) => {
            try {
                await fs.access(path.resolve(__dirname, "..", url));
                await fs.unlink(path.resolve(__dirname, "..", url));
            } catch {}
        }));
        await sequelize.drop()
    });
    describe("saveFile test", () => {
        it("should save a file with local storage strategy", async () => {
            const file = globalFile[0];
            const result = await fileHandle.saveFile(file.url, {
                ...file,
                file: {
                    path: path.resolve(__dirname, "..", file.url)
                }
            });

            assert.deepStrictEqual(result.toJSON(), {
                ...file,
                strategy: "local",
                local: {
                    id: 1,
                    fileId: file.url,
                    path: path.resolve(__dirname, "..", file.url)
                }
            });
        });
        it("should save a file with database storage strategy", async () => {
            const file = globalFile[1];
            const result = await fileHandle.saveFile(file.url, {
                ...file,
                file: globalD3Dsv
            });

            const { database, ...info } = result.get();

            assert.deepStrictEqual(info, { ...file });

            const { table, data, ...other } = database.get();

            assert.deepStrictEqual(table.length, 12);
            assert.deepStrictEqual(other, {
                id: 1,
                columns: ["time", "value"],
                fileId: file.url
            });
        })
    });
    describe("getFileById test", () => {
        it("should get a file with local storage", async () => {
            const file = globalFile[0];
            const result = await fileHandle.getFileByUrl(file.url);

            assert.deepStrictEqual(result.toJSON(), {
                ...file,
                strategy: "local",
                local: {
                    fileId: file.url,
                    path: path.resolve(__dirname, "..", file.url)
                },
                database: null
            });
        });
        it("should get a file with database storage", async () => {
            const file = globalFile[1];
            const result = await fileHandle.getFileByUrl(file.url);

            const { database, ...info } = result.get();

            assert.deepStrictEqual(info, {
                ...file,
                local: null
            });

            const { table, data, ...other } = database.get();

            assert.strictEqual(table.length, 12);
            assert.deepStrictEqual((await data).map(value => value.toJSON()), globalD3Dsv.map((value, index) => {
                return { ...value };
            }));
            assert.deepStrictEqual(other, {
                columns: ["time", "value"],
                fileId: file.url
            });
        });
        it("should return false with unknown url", async () => {
            const result = await fileHandle.getFileByUrl("unknown-url");

            assert.strictEqual(result, false);
        });
    });
    describe("updateFile test", () => {
        it("should update name and info", async () => {
            const file = globalFile[0];
            const result = await fileHandle.updateFile(file.url, {
                name: "new-name",
                info: "new-info"
            });

            assert.strictEqual(result, true);

            const data = await fileHandle.getFileByUrl(file.url);

            assert.deepStrictEqual(data.toJSON(), {
                ...file,
                name: "new-name",
                info: "new-info",
                strategy: "local",
                local: {
                    fileId: file.url,
                    path: path.resolve(__dirname, "..", file.url)
                },
                database: null
            });
        });
        it("should update file and remove old strategy", async () => {
            const file = globalFile[0];
            const result = await fileHandle.updateFile(file.url, {
                strategy: "database",
                file: globalD3Dsv
            });

            assert.strictEqual(result, true);
        });
        it("should not update", async () => {
            const result = await fileHandle.updateFile(globalFile[0].url, { unknown: "unknown" });

            assert.strictEqual(result, false);
        });
    });
    describe("deleteFile test", () => {
        it(`should return true and remove row`, async () => {
            const result = await fileHandle.deleteFile(globalFile[0].url);

            assert.strictEqual(result, true);
        });
        it("should return false with a fail operation", async () => {
            const result = await fileHandle.deleteFile("foobar");

            assert.strictEqual(result, false);
        });
    });
});
