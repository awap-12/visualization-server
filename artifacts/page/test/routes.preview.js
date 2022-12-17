const sequelize = require("../handles/model");
const previewRoute = require("../routes/preview");
const request = require("supertest");
const express = require("express");
const assert = require("node:assert");
const { resolve } = require("node:path");

const { User, View } = sequelize.models;

describe("preview route test", () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/", previewRoute);

    const agent = request.agent(app);

    let idCache = null;
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.create({ name: "test-name", password: "test-password" });
        const result = await View.create({ description: "test-view" });
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
