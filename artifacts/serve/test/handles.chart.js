const sequelize = require("../handles/model");
const chartHandle = require("../handles/chart");
const fileHandle = require("../handles/file");
const assert = require("node:assert");
const fs = require("node:fs/promises");
const path = require("node:path");

const { User, Chart } = sequelize.models;

describe("chart handle test", () => {
    const globalChart = {
        name: "test-chart-name",
        description: "test-chart-desc"
    };
    const globalD3Dsv = ["01", "02", "03", "04"].map(value => ({
        time: `test-time-${value}`,
        value: `test-value-${value}`
    }));
    globalD3Dsv.columns = ["time", "value"];
    const globalFile = ["01", "02"].map(value => ({
        url: `test/fixtures/test-${value}`,
        name: `test-file-${value}`,
        info: `test-info-${value}`
    }));
    globalFile[0] = { ...globalFile[0], file: { path: path.resolve(__dirname, "fixtures/test.foo") }};
    globalFile[1] = { ...globalFile[1], strategy: "database", file: globalD3Dsv };
    let ownerCache= [], idCache = [], inspector = [];
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.create({ name: "test-name", password: "test-password" });
    });
    after("database clean", async () => {
        try {
            await fs.access(path.resolve(__dirname, "fixtures/test.foo"));
            await fs.unlink(path.resolve(__dirname, "fixtures/test.foo"));
        } catch {}
        await sequelize.drop();
    });
    describe("saveChart test", () => {
        beforeEach(async () => await fs.writeFile(path.resolve(__dirname, "fixtures/test.foo"), ''));
        it("should create a new chart with local storage and move temp file `fixtures/test.foo` to `fixtures/test-01`", async () => {
            const { file, ...other } = globalFile[0];

            const result = await chartHandle.saveChart(1, [globalFile[0]], globalChart);

            /* inspector */ {
                inspector.push(result.toJSON());
                console.dir(inspector, { depth: null, colors: true });
            }

            const { id, Files, ...chart } = result.get();
            idCache.push(id);

            // check chart generated id
            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(chart, {
                ...globalChart,
                userId: 1
            });

            const { ChartFile, local, database, owner, ...File } = Files[0].get();
            ownerCache.push(owner);

            // check file create owner
            assert.strictEqual(id, owner);
            // check file content
            assert.deepStrictEqual(File, {
                ...other,
                strategy: "local"
            });
        });
        it("should create a new chart use shared file with local storage", async () => {
            const { file, ...other } = globalFile[0];

            const result = await chartHandle.saveChart(1, [globalFile[0]], {
                name: "other-chart-name",
                description: "other-chart-desc"
            });

            /* inspector */ {
                inspector.push(result.toJSON());
                console.dir(inspector, { depth: null, colors: true });
            }

            const { id, Files, ...chart } = result.get();
            idCache.push(id);

            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(chart, {
                name: "other-chart-name",
                description: "other-chart-desc",
                userId: 1
            });

            const { ChartFile, local, database, owner, ...File } = Files[0].get();
            ownerCache.push(owner);

            // check file create owner
            assert.strictEqual(owner, ownerCache[0]); // shared
            assert.deepStrictEqual(File, {
                ...other,
                strategy: "local"
            });
        });
        it("should create a chart and use multiple files, a shared file and another new database storage", async () => {
            const result = await chartHandle.saveChart(1, globalFile, globalChart);

            /* inspector */ {
                inspector.push({
                    ...result.toJSON(),
                    Files: await Promise.all(result.toJSON().Files.map(async value => {
                        if (!!value.database) {
                            const {data} = value.database;
                            value.database.data = (await data).map(value => value.toJSON());
                            return value;
                        } else return value;
                    }))
                });
                console.dir(inspector, { depth: null, colors: true });
            }

            const { id, Files, ...chart } = result.get();
            idCache.push(id);

            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(chart, {
                ...globalChart,
                userId: 1
            });

            let owners = [];

            Files.map(value => value.toJSON()).forEach(({ ChartFile, local, database, owner, ...File }, index) => {
                const { file, ...other } = globalFile[index];
                owners.push(owner);
                switch (index) {
                    case 0:
                        assert.strictEqual(owner, ownerCache[0]); // shared
                        break;
                    case 1:
                        assert.strictEqual(owner, id);
                        break;
                }
                assert.deepStrictEqual(File, {
                    strategy: "local",
                    ...other
                });
            });

            ownerCache.push(owners);
        });
    });
    describe("getChart test", () => {
        let mapping;
        before(() => {
            mapping = {
                [idCache[0]]: {
                    ...globalChart,
                    userId: 1
                },
                [idCache[1]]: {
                    name: "other-chart-name",
                    description: "other-chart-desc",
                    userId: 1
                },
                [idCache[2]]: {
                    ...globalChart,
                    userId: 1
                }
            };
        });
        it("should get all chart", async () => {
            const result = await chartHandle.getChart();

            for (let i = 0; i < result.length; i++) {
                const { id, ...other } = result[i].toJSON();
                assert.deepStrictEqual(other, mapping[id]);
            }
        });
        it("should get a chart", async () => {
            const result = await chartHandle.getChart(1);

            assert.strictEqual(result.length, 1);
        });
        it("should get chart with order", async () => {
            const result = await chartHandle.getChart(undefined, [["id", "DESC"]]), collector =[];

            for (let i = 0; i < result.length; i++) {
                const { id, ...other } = result[i].toJSON();
                collector.push(id);
                assert.deepStrictEqual(other, mapping[id]);
            }

            assert.deepStrictEqual(collector, structuredClone(idCache).sort((a, b) => b.localeCompare(a)));
        });
    });
    describe("findChart test", () => {
        let mapping;
        before(() => {
            mapping = {
                [idCache[0]]: {
                    ...globalChart,
                    userId: 1
                },
                [idCache[2]]: {
                    ...globalChart,
                    userId: 1
                }
            };
        });
        it("should search chart with `test`", async () => {
            const result = await chartHandle.findChart("test");

            for (let i = 0; i < result.length; i++) {
                const { id, ...other } = result[i].toJSON();
                assert.deepStrictEqual(other, mapping[id]);
            }
        });
        it("should return false with bad search", async () => {
            const result = await chartHandle.findChart("balabalabala");

            assert.strictEqual(result, false);
        });
    });
    describe("getChartById test", () => {
        it("should get the first created chart", async () => {
            const { file, ...other} = globalFile[0];
            const result = await chartHandle.getChartById(idCache[0]);

            const { Files, ...Chart } = result.get();
            assert.deepStrictEqual(Chart, {
                id: idCache[0],
                ...globalChart,
                userId: 1,
            });

            const { ChartFile, local, database, ...File } = Files[0].get();
            assert.deepStrictEqual(File, {
                ...other,
                strategy: "local",
                owner: ownerCache[0]
            });
            assert.deepStrictEqual(ChartFile.get(), {
                chartId: idCache[0],
                fileUrl: other.url
            });
            assert.deepStrictEqual(local.get(), {
                fileId: other.url,
                path: path.resolve(__dirname, "..", other.url)
            });
        });
        it("should get the chart which created by multiple files", async () => {
            const result = await chartHandle.getChartById(idCache[2]);

            const { Files, ...chart } = result.get();

            assert.deepStrictEqual(chart, {
                id: idCache[2],
                ...globalChart,
                userId: 1
            });

            Files.map(value => value.toJSON()).forEach(({ ChartFile, owner, local, database, ...File }, index) => {
                const { file, ...other } = globalFile[index];
                assert.deepStrictEqual(owner, ownerCache[2][index]);
                assert.deepStrictEqual(File, {
                    strategy: "local",
                    ...other
                });
            });
        });
        it("should return false with unknown id", async () => {
            const result = await chartHandle.getChartById("foobar");

            assert.strictEqual(result, false);
        });
    });
    describe("findChart test", () => {
        it("should get a group of chart", async () => {
            const [result] = await chartHandle.findChart("other-chart-name");

            assert.deepStrictEqual(result.toJSON(), {
                id: idCache[1],
                name: "other-chart-name",
                description: "other-chart-desc",
                userId: 1
            });
        });
        it("should return false with none matching name", async () => {
            const result = await chartHandle.findChart("foobar");

            assert.strictEqual(result, false);
        });
    });
    describe("updateChart test", () => {
        it("should update chart table data", async () => {
            const result = await chartHandle.updateChart(idCache[0], {
                name: "new-chart-name",
                description: "new-chart-desc"
            });

            assert.strictEqual(result, true);

            const data = await chartHandle.getChartById(idCache[0]);

            /* inspector */ {
                try {
                    assert.deepStrictEqual(data.toJSON(), inspector[0]);
                } catch (err) {
                    console.log(err.message);
                }

                inspector[0] = data.toJSON();
            }

            // more assert will do in next test
        });
        it(`should insert file with ${globalFile[0].url}`, async () => {
            await fs.writeFile(path.resolve(__dirname, "fixtures/test.foo"), '')

            const result = await chartHandle.updateChart(idCache[0], {
                files: [{
                    url: globalFile[1].url,
                    operation: "insert"
                }]
            });

            assert.strictEqual(result, true);

            const data = await chartHandle.getChartById(idCache[0]);

            /* inspector */ {
                const promised = {
                    ...data.toJSON(),
                    Files: await Promise.all(data.toJSON().Files.map(async value => {
                        if (!!value.database) {
                            const {data} = value.database;
                            value.database.data = (await data).map(value => value.toJSON());
                            return value;
                        } else return value;
                    }))
                };

                try {
                    assert.deepStrictEqual(promised, inspector[0]);
                } catch (err) {
                    console.log(err.message);
                }

                inspector[0] = promised;
            }

            const { Files, ...chart } = data.get();

            assert.deepStrictEqual(chart, {
                id: idCache[0],
                name: "new-chart-name",
                description: "new-chart-desc",
                userId: 1
            });

            Files.map(value => value.toJSON()).forEach(({ ChartFile, owner, local, database, ...File }, index) => {
                const { file, ...other } = globalFile[index];
                assert.deepStrictEqual(owner, ownerCache[2][index]); // owner should same as owner cache.
                assert.deepStrictEqual(File, {
                    strategy: "local",
                    ...other
                });
            });
        });
        it("should update file with modified operation by file owner", async () => {
            const localD3Dsv = [
                { time: "test-time-01", value: "test-value-05" },
                { time: "test-time-03", value: "test-value-03" },
                { time: "test-time-10", value: "test-value-10" },
                { time: "test-time-30", value: "test-value-30" },
                { time: "test-time-40", value: "test-value-40" },
                { time: "test-time-20", value: "test-value-20" },
                { time: "test-time-04", value: "test-value-04" },
                { time: "test-time-02", value: "test-value-02" },
            ];
            localD3Dsv.columns = ["time", "value"];
            const localFile = {
                url: "test/fixtures/test-new",
                name: "test-file-new",
                strategy: "database",
                info: "test-info-new",
                file: localD3Dsv
            }

            const result = await chartHandle.updateChart(idCache[0], {
                files: [{
                    url: globalFile[1].url,
                    operation: "modify",
                    options: {
                        ...localFile
                    }
                }]
            });

            assert.strictEqual(result, true);

            const data = await chartHandle.getChartById(idCache[0]);

            /* inspector */ {
                const promised = {
                    ...data.toJSON(),
                    Files: await Promise.all(data.toJSON().Files.map(async value => {
                        if (!!value.database) {
                            const {data} = value.database;
                            value.database.data = (await data).map(value => value.toJSON());
                            return value;
                        } else return value;
                    }))
                };

                try {
                    assert.deepStrictEqual(promised, inspector[0]);
                } catch (err) {
                    console.log(err.message);
                }

                inspector[0] = promised;
            }

            const { Files, ...chart } = data.get();

            assert.deepStrictEqual(chart, {
                id: idCache[0],
                name: "new-chart-name",
                description: "new-chart-desc",
                userId: 1
            });

            Files.map(value => value.toJSON()).forEach(({ ChartFile, owner, local, database, ...File }, index) => {
                const { file, ...other } = index === 1 ? localFile : globalFile[0];
                assert.deepStrictEqual(File, {
                    strategy: "local",
                    ...other
                });
            });
        });
        it("should remove file link with deleted operation with file used by multi chart", async () => {
            const result = await chartHandle.updateChart(idCache[1], {
                files: [{
                    url: globalFile[0].url,
                    operation: "delete"
                }]
            });

            assert.strictEqual(result, true);

            const data = await chartHandle.getChartById(idCache[1]);

            /* inspector */ {
                const promised = {
                    ...data.toJSON(),
                    Files: await Promise.all(data.toJSON().Files.map(async value => {
                        if (!!value.database) {
                            const {data} = value.database;
                            value.database.data = (await data).map(value => value.toJSON());
                            return value;
                        } else return value;
                    }))
                };

                try {
                    assert.deepStrictEqual(promised, inspector[1]);
                } catch (err) {
                    console.log(err.message);
                }

                inspector[1] = promised;
            }
        });
        it("should remove file with deleted operation when file used by single chart", async () => {
            const result = await chartHandle.updateChart(idCache[2], {
                files: [{
                    url: globalFile[1].url,
                    operation: "delete"
                }]
            });

            assert.strictEqual(result, true);

            const data = await chartHandle.getChartById(idCache[2]);

            /* inspector */ {
                const promised = {
                    ...data.toJSON(),
                    Files: await Promise.all(data.toJSON().Files.map(async value => {
                        if (!!value.database) {
                            const {data} = value.database;
                            value.database.data = (await data).map(value => value.toJSON());
                            return value;
                        } else return value;
                    }))
                };

                try {
                    assert.deepStrictEqual(promised, inspector[2]);
                } catch (err) {
                    console.log(err.message);
                }

                inspector[2] = promised;
            }
        });
    });
    describe("deleteChart test", () => {
        it("should return true and remove", async () => {
            const result = await chartHandle.deleteChart(idCache[0]);

            assert.strictEqual(result, true);

            const fileResult = await fileHandle.getFileByUrl(globalFile[0].url);

            assert.strictEqual(!!fileResult, true);
        });
        it("should return false with a fail operation", async () => {
            const result = await chartHandle.deleteChart("foobar");

            assert.strictEqual(result, false);
        });
        it("should remove all when clean up dependencies", async () => {
            {
                const result = await chartHandle.deleteChart(idCache[1]);

                assert.strictEqual(result, true);

                const fileResult = await fileHandle.getFileByUrl(globalFile[1].url);

                assert.strictEqual(!!fileResult, false);
            }
            {
                const result = await chartHandle.deleteChart(idCache[2]);

                assert.strictEqual(result, true);

                const fileResult = await fileHandle.getFileByUrl(globalFile[0].url);

                assert.strictEqual(!!fileResult, false);
            }
        });
        it
    });
    describe("user relative destroy", () => {
        it("should delete chart when linked user removed", async () => {
            await User.destroy({
               where: {
                   id: 1
               }
            });
            const result = await Chart.findAll({
                where: {
                    name: globalChart.name
                }
            });
            assert.strictEqual(result.length, 0);
        });
    });
});
