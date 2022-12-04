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
            name: "test-file-name",
            path: "/fixtures/foo.bar",
            size: 0
        },{
            name: "test-file-name",
            path: "/fixtures/bar.foo",
            size: 0
        }]
    let idCache = [];
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.bulkCreate([{ name: `test-name`, password: `test-password` }]);
        await fs.writeFile(path.resolve(__dirname, "fixtures/foo.bar"), '');
        await fs.writeFile(path.resolve(__dirname, "fixtures/bar.foo"), '');
    });
    after("database clean", async () => sequelize.drop());
    describe("saveChart test", () => {
        it("should create a chart", async () => {
            const result = await chartHandle.saveChart({ id: 1 }, [globalFile[0]], globalChart.name, globalChart.description);

            const { id, Files, ...chart } = result.get();
            const { ChartFile, createdAt, updatedAt, ...file } = Files[0].get();

            idCache.push(id);

            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(file, {
                name: globalFile[0].name,
                info: '',
                path: globalFile[0].path,
                size: globalFile[0].size
            });
            assert.deepStrictEqual(chart, {
                name: globalChart.name,
                description: globalChart.description,
                userId: 1
            });
        });
        it("should use shared file", async () => {
            const result = await chartHandle.saveChart({ id: 1 }, [globalFile[0]], "other-chart-name", "other-chart-desc");

            const { id, Files, ...chart } = result.get();
            const { ChartFile, createdAt, updatedAt, ...file } = Files[0].get();

            idCache.push(id);

            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(file, {
                name: globalFile[0].name,
                info: '',
                path: globalFile[0].path,
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

            assert.deepStrictEqual(result.get(), {
                id: idCache[0],
                name: globalChart.name,
                description: globalChart.description,
                userId: 1
            });
        });
        it("should return false with unknown id", async () => {
            const result = await chartHandle.getChartById("foobar");

            assert.strictEqual(result, false);
        });
    });
    describe("getChart test", () => {
        it("should get a group of chart", async () => {
            const [result] = await chartHandle.getChart(globalChart.name);

            assert.deepStrictEqual(result.get(), {
                id: idCache[0],
                name: globalChart.name,
                description: globalChart.description,
                userId: 1
            });
        });
        it("should return false with none matching name", async () => {
            const result = await chartHandle.getChart("foobar");

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

            const fileResult = await fileHandle.getFileByPath(globalFile[0].path);

            assert.strictEqual(!!fileResult, true);
        });
        it("should return false with a fail operation", async () => {
            const result = await chartHandle.deleteChart("foobar");

            assert.strictEqual(result, false);
        });
        it("should remove all when clean up dependencies", async () => {
            const result = await chartHandle.deleteChart(idCache[1]);

            assert.strictEqual(result, true);

            const fileResult = await fileHandle.getFileByPath(globalFile[0].path);

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
