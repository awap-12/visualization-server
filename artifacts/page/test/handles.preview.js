const previewHandle = require("../handles/preview.js");
const sequelize = require("../handles/model.js");
const assert = require("node:assert");
const path = require("node:path");

const { User, View } = sequelize.models;

describe("preview handle test", () => {
    let idCache = null, imgCache = null;
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.create({ name: "test-name", password: "test-password" });
        const { id } = await View.create({ description: "test-view" });
        idCache = id;
    });
    after("database clean", async () => sequelize.drop());
    describe("savePreview test", () => {
        it("should create a preview", async () => {
            const result = await previewHandle.savePreview(idCache, {
                mimetype: "image/png",
                path: path.resolve(__dirname, "fixtures/foo.png")
            });

            const { id, type, data } = result.toJSON();

            imgCache = data;

            assert.strictEqual(id, 1);
            assert.strictEqual(type, "image/png");
        });
    });
    describe("getPreview test", () => {
        it("should get a preview", async () => {
            const result = await previewHandle.getPreview(idCache);

            const { id, type, data } = result.toJSON();

            assert.deepStrictEqual(data, imgCache);
            assert.strictEqual(id, 1);
            assert.strictEqual(type, "image/png");
        });
        it("should return false with unknown viewId", async () => {
            const result = await previewHandle.getPreview("unknown");

            assert.strictEqual(result, false);
        });
    });
    describe("updatePreview test", () => {
        it("should update a preview", async () => {
            const result = await previewHandle.updatePreview(idCache, {
                mimetype: "image/png",
                path: path.resolve(__dirname, "fixtures/bar.png")
            });

            assert.strictEqual(result, true);

            const { id, type, data } = await previewHandle.getPreview(idCache);

            assert.notDeepStrictEqual(data, imgCache);
            assert.strictEqual(id, 1);
            assert.strictEqual(type, "image/png");
        });
    });
});
