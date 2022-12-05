const request = require("supertest");
const sequelize = require("../handles/model");
const express = require("express");
const chartRoute = require("../routes/chart");
const path = require("node:path");
const assert = require("node:assert");

const { User } = sequelize.models;

describe("chart route test", () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/", chartRoute);

    const agent = request.agent(app);
    let idCache = [];
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.bulkCreate([{ name: "test-name", password: "test-password" }]);
    });
    after("database clean", async () => sequelize.drop());
    describe("POST /", () => {
        it("should create a chart", done => {
            agent
                .post("/")
                .field("id", 1)
                .field("name", "test-name")
                .field("description", "test-desc")
                .field("files",
                    [{ info: "test-desc" }, { info: "test-desc" }]
                        .map(value => JSON.stringify(value))
                )
                .attach("attachment", path.resolve(__dirname, "fixtures/bar.csv"))
                .attach("attachment", path.resolve(__dirname, "fixtures/foo.csv"))
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    idCache.push(res.body.id);
                    assert.deepStrictEqual(res.body, {
                        id: idCache[0],
                        name: "test-name",
                        description: "test-desc",
                        userId: 1,
                        Files: [
                            {
                                info: "test-desc",
                                name: "Bar.csv",
                                size: 0,
                                url: `static/${idCache[0]}/Bar.csv`,
                                ChartFile: {
                                    ChartId: idCache[0],
                                    FileUrl: `static/${idCache[0]}/Bar.csv`
                                }
                            },
                            {
                                info: "test-desc",
                                name: "Foo.csv",
                                size: 0,
                                url: `static/${idCache[0]}/Foo.csv`,
                                ChartFile: {
                                    ChartId: idCache[0],
                                    FileUrl: `static/${idCache[0]}/Foo.csv`
                                }
                            }
                        ]
                    });
                    done();
                });
        });
    });
    describe("GET /", () => {
        it("should get a chart", done => {
            agent
                .get(`/${idCache[0]}`)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    assert.deepStrictEqual(res.body, {
                        id: idCache[0],
                        name: "test-name",
                        description: "test-desc",
                        userId: 1,
                        Files: [
                            {
                                info: "test-desc",
                                name: "Bar.csv",
                                size: 0,
                                url: `static/${idCache[0]}/Bar.csv`,
                                ChartFile: {
                                    ChartId: idCache[0],
                                    FileUrl: `static/${idCache[0]}/Bar.csv`
                                }
                            },
                            {
                                info: "test-desc",
                                name: "Foo.csv",
                                size: 0,
                                url: `static/${idCache[0]}/Foo.csv`,
                                ChartFile: {
                                    ChartId: idCache[0],
                                    FileUrl: `static/${idCache[0]}/Foo.csv`
                                }
                            }
                        ]
                    });
                    done();
                });
        });
    });
});
