const sequelize = require("../handles/model");
const chartHandle = require("serve/handles/chart");
const previewRoute = require("../routes/preview");
const request = require("supertest");
const express = require("express");
const assert = require("node:assert");
const { resolve } = require("node:path");

const { User } = sequelize.models;

describe("preview route test", () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/", previewRoute);

    const agent = request.agent(app);

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
    describe("POST /", () => {
        it("should save a image to database", done => {
            agent
                .post(`/${idCache}`)
                .attach("preview", resolve(__dirname, "fixtures/foo.png"))
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    console.dir(res.body, { depth: null, colors: true });

                    const { id, type } = res.body;

                    //const buffer = readFile(resolve(__dirname, "fixtures/foo.png"));
                    assert.strictEqual(id, 1);
                    assert.strictEqual(type, "image/png");

                    done();
                });
        });
    });
});
