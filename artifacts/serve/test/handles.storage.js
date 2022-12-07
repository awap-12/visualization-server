const sequelize = require("../handles/model");
const storageHandle = require("../handles/storage");
const assert = require("node:assert");
const fs = require("node:fs/promises");
const path = require("node:path");

const { File } = sequelize.models;

describe("storage handle test", () => {
    const globalFile = [
        {
            url: "fixtures/test-01",
            name: "test-file-01",
            info: "test-info-01",
            size: 1024
        }, {
            url: "fixtures/test-02",
            name: "test-file-02",
            strategy: "database",
            info: "test-info-02",
            size: 1024
        }
    ];
    const globalD3Dsv = [
        { time: "test-time-01", value: "test-value-01" },
        { time: "test-time-02", value: "test-value-02" },
        { time: "test-time-03", value: "test-value-03" },
        { time: "test-time-04", value: "test-value-04" }
    ];
    globalD3Dsv.columns = ["time", "value"];
    const idCache = [];
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await File.bulkCreate(globalFile);
        await Promise.all(globalFile.map(async ({ url }) => {
            await fs.writeFile(path.resolve(__dirname, url), '');
        }));
    });
    after("database clean", async () => {
        await Promise.all(globalFile.map(async ({ url }) => {
            try {
                await fs.access(path.resolve(__dirname, url));
                await fs.unlink(path.resolve(__dirname, url));
            } catch {}
        }));
        await sequelize.drop();
    });
    describe("saveStorage test", () => {
        it("should save file by local storage", async () => {
            const file = globalFile[0];
            const result = await storageHandle.saveStorage(file.url, path.resolve(__dirname, file.url), file.strategy);
            assert.deepStrictEqual(result.toJSON(), {
                id: 1,
                path: path.resolve(__dirname, file.url),
                fileId: file.url
            });
        });
        it("should return error with unknown path", async () => {
            const file = globalFile[0];
            await assert.rejects(async () => {
                await storageHandle.saveStorage(file.url, path.resolve(__dirname, "unknown.balabala"), file.strategy);
            }, err => {
                assert.strictEqual(err.errno, -4058)
                assert.strictEqual(err.code, "ENOENT");
                return true;
            });
        });
        it("should save by database storage with duplicate file id", async () => {
            const file = globalFile[0];
            const result = await storageHandle.saveStorage(file.url, globalD3Dsv, "database");
            assert.deepStrictEqual(result.map(value => value.toJSON()), globalD3Dsv.map((value, index) => {
                return { id: index + 1, ...value };
            }));
        });
        it("should save by database storage with optional name", async () => {
            const file = globalFile[1]; globalD3Dsv.name = "test-name";
            const result = await storageHandle.saveStorage(file.url, globalD3Dsv, file.strategy);
            assert.deepStrictEqual(result.map(value => value.toJSON()), globalD3Dsv.map((value, index) => {
                return { id: index + 1, ...value };
            }));
        });
        it("should return error with duplicate file id", async () => {
            const file = globalFile[1];
            await assert.rejects(async () => {
                await storageHandle.saveStorage(file.url, globalD3Dsv, file.strategy);
            }, () => {
                return true
            });
        });
    });
    describe("getStorage test", () => {
        it("should return a file instance including both local and database storage", async () => {
            const file = globalFile[0];
            const result = await storageHandle.getStorage(file.url);

            const { database, local, ...info } = result.get();

            assert.deepStrictEqual(info, { ...file, strategy: "local" });
            assert.deepStrictEqual(local.get(), {
                path: path.resolve(__dirname, file.url),
                fileId: file.url
            });

            const { table, ...other } = database.get();

            idCache.push(table);

            assert.deepStrictEqual(table.length, 12);
            assert.deepStrictEqual(other, {
                columns: ["time", "value"],
                fileId: file.url
            });
        });
        it("should return a file instance including database storage", async () => {
            const file = globalFile[1];
            const result = await storageHandle.getStorage(file.url);

            const { database, ...info } = result.get();

            assert.deepStrictEqual(info, { ...file, local: null });

            const { table, ...other } = database.get();

            idCache.push(table);

            assert.strictEqual(table.length, 9);
            assert.deepStrictEqual(other, {
                columns: ["time", "value"],
                fileId: file.url
            });
        });
    });
    describe("deleteStorage test", () => {
        it(`should return true and delete file: ${globalFile[0].url}`, async () => {
            const file = globalFile[0];
            const result = await storageHandle.deleteStorage(file.url);

            assert.strictEqual(result, true);

            await assert.rejects(async () => {
                await fs.access(path.resolve(__dirname, file.url))
            }, () => {
                return true;
            });

            await assert.rejects(async () => {
                await sequelize.models[idCache[0]].findAll();
            }, () => {
                return true;
            });
        });
        it(`should return true and delete file: ${globalFile[1].url}`, async () => {
            const file = globalFile[1];
            const result = await storageHandle.deleteStorage(file.url);

            assert.strictEqual(result, true);

            await assert.rejects(async () => {
                await sequelize.models[idCache[1]].findAll();
            }, () => {
                return true;
            });
        });
        it("should return false when trying to remove unknown url", async () => {
             const result = await storageHandle.deleteStorage("unknown");

             assert.strictEqual(result, false);
        });
    });
});
