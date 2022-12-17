const storageHandle = require("../handles/storage.js");
const sequelize = require("../handles/model.js");
const assert = require("node:assert");
const fs = require("node:fs/promises");
const path = require("node:path");

const { File, Database } = sequelize.models;

describe("storage handle test", () => {
    const globalFile = ["01", "02", "03"].map(value => ({
        url: `test/fixtures/test-${value}`,
        name: `test-file-${value}`,
        info: `test-info-${value}`,
        owner: `test-owner-${value}`
    }));
    globalFile[1] = { ...globalFile[1], strategy: "database" };
    globalFile[2] = { ...globalFile[2], strategy: "database" };
    const globalD3Dsv = ["01", "02", "03", "04"].map(value => ({
        time: `test-time-${value}`,
        value: `test-value-${value}`
    }));
    globalD3Dsv.columns = ["time", "value"];
    const idCache = [];
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await File.bulkCreate(globalFile);
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
        await sequelize.drop();
    });
    describe("saveStorage test", () => {
        it("should save file by local storage", async () => {
            const file = globalFile[0];
            await fs.writeFile(path.resolve(__dirname, "fixtures/test-move"), '');

            const result = await storageHandle.saveStorage(file.url, path.resolve(__dirname, "fixtures/test-move"), file.strategy);

            assert.deepStrictEqual(result.toJSON(), {
                id: 1,
                path: path.resolve(__dirname, "..", file.url),
                fileId: file.url
            });
        });
        it("should return error and rollback with unknown path", async () => {
            const file = globalFile[0];
            await assert.rejects(async () => {
                await storageHandle.saveStorage(file.url, path.resolve(__dirname, "unknown.balabala"), file.strategy);
            }, err => {
                assert.strictEqual(err instanceof Error, true);
                assert.strictEqual(err.message.includes("no such file or directory"), true);

                return true;
            });
        });
        it("should save by database storage", async () => {
            const file = globalFile[1];
            const result = await storageHandle.saveStorage(file.url, globalD3Dsv, "database");

            const { table, data, ...other } = result.get();

            assert.strictEqual(table.length, 12);
            assert.deepStrictEqual((await data).map(value => value.toJSON()), globalD3Dsv.map((value, index) => {
                return { ...value };
            }));
            assert.deepStrictEqual(other, {
                id: 1,
                columns: ["time", "value"],
                fileId: file.url
            });
        });
        it("should save by database storage with optional name", async () => {
            const file = globalFile[2]; globalD3Dsv.name = "test-name";
            const result = await storageHandle.saveStorage(file.url, globalD3Dsv, file.strategy);

            const { table, data, ...other } = result.get();

            assert.strictEqual(table.length, 9);
            assert.deepStrictEqual((await data).map(value => value.toJSON()), globalD3Dsv.map(value => {
                return { ...value };
            }));
            assert.deepStrictEqual(other, {
                id: 2,
                columns: ["time", "value"],
                fileId: file.url
            });
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
                path: path.resolve(__dirname, "..", file.url),
                fileId: file.url
            });
        });
        it("should return a file instance including database storage", async () => {
            const file = globalFile[1];
            const result = await storageHandle.getStorage(file.url);

            const { database, ...info } = result.get();

            assert.deepStrictEqual(info, { ...file, local: null });

            const { table, data, ...other } = database.get();

            idCache.push(table);

            assert.strictEqual(table.length, 12);
            assert.deepStrictEqual(other, {
                columns: ["time", "value"],
                fileId: file.url
            });
        });
    });
    describe("updateStorage test", () => {
        it("should update local storage file", async () => {
            await fs.writeFile(path.resolve(__dirname, "fixtures/test-move"), 'foo');

            const result = await storageHandle.updateStorage(globalFile[0].url, path.resolve(__dirname, "fixtures/test-move"));

            assert.strictEqual(result, true);

            const data = await fs.readFile(path.resolve(__dirname, "..", globalFile[0].url));

            assert.strictEqual(data.toString(), "foo");
        });
        it("should update database storage table", async () => {
            const file = globalFile[1];
            const localD3Dsv = [
                { time: "test-time-01", value: "test-value-05" },
                { time: "test-time-03", value: "test-value-03" },
                { time: "test-time-10", value: "test-value-10" },
                { time: "test-time-30", value: "test-value-30" },
                { time: "test-time-02", value: "test-value-02" },
                { time: "test-time-04", value: "test-value-04" },
                { time: "test-time-20", value: "test-value-20" },
                { time: "test-time-40", value: "test-value-40" }
            ];
            localD3Dsv.columns = ["time", "value"];

            const result = await storageHandle.updateStorage(file.url, localD3Dsv, "database");

            assert.strictEqual(result, true);

            const { data } = await Database.findOne({
                where: {
                    fileId: file.url
                }
            });
            assert.deepStrictEqual((await data).map(value => value.toJSON()), [...localD3Dsv]);
        });
        it("should remove and create new database storage table", async () => {
            const file = globalFile[2];
            const localD3Dsv = globalD3Dsv.map(({ time, value }) => ({ type: "test-type", time, value }));
            localD3Dsv.columns = ["type", "time", "value"];

            const result = await storageHandle.updateStorage(file.url, localD3Dsv, "database");

            assert.strictEqual(result, true);

            const { data } = await Database.findOne({
                where: {
                    fileId: file.url
                }
            });
            assert.deepStrictEqual((await data).map(value => value.toJSON()), [...localD3Dsv]);
        });
    });
    describe("deleteStorage test", () => {
        it(`should return true and delete file: ${globalFile[0].url}`, async () => {
            const file = globalFile[0];

            const result = await storageHandle.deleteStorage(file.url);

            assert.strictEqual(result, true);

            await assert.rejects(async () => {
                await fs.access(path.resolve(__dirname, "..", file.url))
            }, err => {
                assert.strictEqual(err instanceof Error, true);
                assert.strictEqual(err.message.includes("no such file or directory"), true);

                return true;
            });
        });
        it(`should return true and delete files: ${globalFile[1].url} and ${globalFile[2].url}`, async () => {
            {
                const result = await storageHandle.deleteStorage(globalFile[1].url);

                assert.strictEqual(result, true);
            }

            {
                const result = await storageHandle.deleteStorage(globalFile[2].url);

                assert.strictEqual(result, true);
            }

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
