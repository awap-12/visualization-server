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
    const globalFile = [
        {
            url: "test/fixtures/foo.bar",
            path: path.resolve(__dirname, "fixtures/test-foo.bar"),
            name: "test-file-name",
            size: 0
        },{
            url: "test/fixtures/bar.foo",
            path: path.resolve(__dirname, "fixtures/test-bar.foo"),
            name: "test-file-name",
            size: 0
        }]
    let idCache = [];
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.bulkCreate([{ name: `test-name`, password: `test-password` }]);
    });
    beforeEach(async () => {
        await fs.writeFile(path.resolve(__dirname, "fixtures/test-foo.bar"), '');
        await fs.writeFile(path.resolve(__dirname, "fixtures/test-bar.foo"), '');
    });
    after("database clean", async () => sequelize.drop());
    describe("saveChart test", () => {
        it("should create a chart", async () => {
            const result = await chartHandle.saveChart(1, [globalFile[0]], globalChart.name, globalChart.description);

            const { id, Files, ...chart } = result.get();
            const { ChartFile, createdAt, updatedAt, ...file } = Files[0].get();

            idCache.push(id);

            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(file, {
                name: globalFile[0].name,
                info: '',
                url: globalFile[0].url,
                size: globalFile[0].size
            });
            assert.deepStrictEqual(chart, {
                name: globalChart.name,
                description: globalChart.description,
                userId: 1
            });
        });
        it("should use shared file", async () => {
            const result = await chartHandle.saveChart(1, [globalFile[0]], "other-chart-name", "other-chart-desc");

            const { id, Files, ...chart } = result.get();
            const { ChartFile, createdAt, updatedAt, ...file } = Files[0].get();

            idCache.push(id);

            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(file, {
                name: globalFile[0].name,
                info: '',
                url: globalFile[0].url,
                size: globalFile[0].size
            });
            assert.deepStrictEqual(chart, {
                name: "other-chart-name",
                description: "other-chart-desc",
                userId: 1
            });
        });
    });
    describe("getChartById test", () => {
        it(`should get a chart ${idCache[0]}`, async () => {
            const result = await chartHandle.getChartById(idCache[0]);

            assert.deepStrictEqual(result.toJSON(), {
                id: idCache[0],
                name: globalChart.name,
                description: globalChart.description,
                userId: 1,
                Files: [
                    {
                        ChartFile: {
                            ChartId: idCache[0],
                            FileUrl: globalFile[0].url
                        },
                        url: globalFile[0].url,
                        name: globalFile[0].name,
                        info: '',
                        size: globalFile[0].size
                    }
                ]
            });
        });
        it("should return false with unknown id", async () => {
            const result = await chartHandle.getChartById("foobar");

            assert.strictEqual(result, false);
        });
    });
    describe("findChart test", () => {
        it("should get a group of chart", async () => {
            const [result] = await chartHandle.findChart(globalChart.name);

            assert.deepStrictEqual(result.get(), {
                id: idCache[0],
                name: globalChart.name,
                description: globalChart.description,
                userId: 1
            });
        });
        it("should return false with none matching name", async () => {
            const result = await chartHandle.findChart("foobar");

            assert.strictEqual(result, false);
        });
    });
    describe("updateChart test", () => {
        it("should update file", async () => {
            const result = await chartHandle.updateChart(idCache[0], {
                files: globalFile
            });

            assert.strictEqual(result, true);
        });
        it("should update file and remove unused file", async () => {
            const result = await chartHandle.updateChart(idCache[0], {
                files: [globalFile[0]]
            });

            assert.strictEqual(result, true);
        });
        it("should update name and info", async () => {
            const result = await chartHandle.updateChart(idCache[0], {
                name: "new-chart-name",
                description: "new-chart-desc"
            });

            assert.strictEqual(result, true);
        });
    });
    describe("deleteChart test", () => {
        it(`should return true and remove ${idCache[0]}`, async () => {
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
            const result = await chartHandle.deleteChart(idCache[1]);

            assert.strictEqual(result, true);

            const fileResult = await fileHandle.getFileByUrl(globalFile[0].url);

            assert.strictEqual(!!fileResult, false);
        });
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
                    name: "user-link"
                }
            });
            assert.strictEqual(result.length, 0);
        });
    });
});
