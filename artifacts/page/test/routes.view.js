const viewRoute = require("../routes/view.js");
const sequelize = require("../handles/model.js");
const request = require("supertest");
const express = require("express");
const path = require("node:path");
const fs = require("node:fs");
const assert = require("node:assert");

const { User, Chart } = sequelize.models;

describe("view route test", () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/", viewRoute);

    const agent = request.agent(app);

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
    let chartIdCache = null, viewIdCache = null;
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.create({ name: "test-name", password: "test-password" });
        const result = await Chart.create({ ...globalChart, userId: 1 });
        chartIdCache = result.id;
    });
    after("database clean", async () => sequelize.drop());
    describe("POST /", () => {
        it("should save a image to database based on view Id", done => {
            agent
                .post("/")
                .field("id", 1)
                .field("charts", chartIdCache)
                .field("display", globalView.display)
                .field("description", globalView.description)
                .attach("preview", globalPreview.path)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    console.dir(res.body, { depth: null, colors: true });

                    const { Charts, id, ...view } = res.body;

                    viewIdCache = id;

                    assert.strictEqual(id.length, 6);
                    assert.deepStrictEqual(view, {
                        ...globalView,
                        userId: 1
                    });

                    done();
                });
        });
    });
});
