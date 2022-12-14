const chartHandle = require("serve/handles/chart");
const previewHandle = require("../handles/preview");
const sequelize = require("../handles/model");
const assert = require("node:assert");
const { resolve } = require("node:path");

const { User } = sequelize.models;

describe("preview handle test", () => {
    const globalD3Dsv = [
        { time: "test-time-01", value: "test-value-01" },
        { time: "test-time-02", value: "test-value-02" },
        { time: "test-time-03", value: "test-value-03" },
        { time: "test-time-04", value: "test-value-04" }
    ];
    globalD3Dsv.columns = ["time", "value"];
    let idCache = null;
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.create({ name: "test-name", password: "test-password" });
        const result = await chartHandle.saveChart(1, [{
            url: "test/fixtures/test",
            name: "test-file",
            strategy: "database",
            info: "test-info",
            file: globalD3Dsv
        }], {
            name: "test-chart-name",
            description: "test-chart-desc"
        });
        idCache = result.id;
    });
    after("database clean", async () => sequelize.drop());
    describe("savePreview test", () => {
        it("should create a preview", async () => {
            const result = await previewHandle.savePreview(idCache, {
                mimetype: "image/png",
                path: resolve(__dirname, "fixtures/foo.png")
            });

            const { id, type } = result.toJSON();

            assert.strictEqual(id, 1);
            assert.strictEqual(type, "image/png");
        });
    });
    describe("getPreview test", () => {
        it("should get a preview", async () => {
            const result = await previewHandle.getPreview(idCache);

            const { id, type } = result.toJSON();

            assert.strictEqual(id, 1);
            assert.strictEqual(type, "image/png");
        });
    });
    describe("updatePreview test", () => {
        it("should update a preview", async () => {
            const result = await previewHandle.updatePreview(idCache, {
                mimetype: "image/png",
                path: resolve(__dirname, "fixtures/bar.png")
            });

            assert.strictEqual(result, false);
        });
    });
});
