const viewHandle = require("../handles/view.js");
const sequelize = require("../handles/model.js");
const assert = require("node:assert");
const path = require("node:path");

const { User, Chart } = sequelize.models;

describe("view handle test", () => {
    const globalChart = {
        name: "test-chart-name",
        description: "test-chart-desc"
    };
    const globalView = {
        display: "flex",
        description: "test-view"
    };
    const globalPreview = {
        mimetype: "image/png",
        path: path.resolve(__dirname, "fixtures/foo.png")
    };
    let chartIdCache = [], viewIdCache = [];
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.create({ name: "test-name", password: "test-password" });
        const chartsResult = await Chart.bulkCreate([
            { ...globalChart, userId: 1 },
            { ...globalChart, userId: 1 }
        ], { individualHooks: true });
        chartsResult.forEach(({ id }) => chartIdCache.push(id));
    });
    after("database clean", async () => sequelize.drop());
    describe("saveView test", () => {
        it("should save a view", async () => {
            const result = await viewHandle.saveView(1, {
                ...globalView,
                charts: chartIdCache[0],
                file: globalPreview
            });

            const { Charts, id, ...view } = result.get();

            viewIdCache.push(id);

            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(view, {
                ...globalView,
                userId: 1
            });
        });
        it("should save a view with shared chart", async () => {
            const result = await viewHandle.saveView(1, {
                ...globalView,
                charts: chartIdCache[0],
                file: globalPreview
            });

            const { Charts, id, ...view } = result.get();

            viewIdCache.push(id);

            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(view, {
                ...globalView,
                userId: 1
            });
        });
        it("should save a view with multi chart", async () => {
            const result = await viewHandle.saveView(1, {
                ...globalView,
                charts: chartIdCache,
                file: globalPreview
            });

            const { Charts, id, ...view } = result.get();

            viewIdCache.push(id);

            assert.strictEqual(id.length, 6);
            assert.deepStrictEqual(view, {
                ...globalView,
                userId: 1
            });
        });
    });
    describe("getViewById test", () => {
        it("should get a view", async () => {
            const viewId = viewIdCache[0];
            const result = await viewHandle.getViewById(viewId);

            const { Charts, ...view } = result.get();

            assert.deepStrictEqual(view, {
                ...globalView,
                id: viewId,
                userId: 1
            });
        });
        it("should return false with unknown view", async () => {
            const result = await viewHandle.getViewById("unknown");

            assert.strictEqual(result, false);
        });
    });
    describe("updateView test", () => {
        it("should update a view with display", async () => {
            const viewId = viewIdCache[0];
            const result = await viewHandle.updateView(viewId, { display: "grid" });

            assert.strictEqual(result, true);
        });
        it("should update a view with desc", async () => {
            const viewId = viewIdCache[0];
            const result = await viewHandle.updateView(viewId, { description: "long description" });

            assert.strictEqual(result, true);
        });
        it("should update charts", async () => {
            const viewId = viewIdCache[0];
            const result = await viewHandle.updateView(viewId, { charts: chartIdCache });

            assert.strictEqual(result, true);
        });
    });
    describe("deleteView test", () => {
        it("should remove a view", async () => {
            const viewId = viewIdCache[0];

            const result = await viewHandle.deleteView(viewId);
            assert.strictEqual(result, true);

            const data = await viewHandle.getViewById(viewId);
            assert.strictEqual(data, false);
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
