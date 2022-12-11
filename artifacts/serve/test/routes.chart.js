const sequelize = require("../handles/model");
const chartRoute = require("../routes/chart");
const request = require("supertest");
const express = require("express");
const assert = require("node:assert");
const path = require("node:path");

const { User } = sequelize.models;

describe("chart route test", () => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/", chartRoute);

    const agent = request.agent(app);

    const globalChart = {
        name: "test-name",
        description: "test-desc"
    };
    const globalLocalFile = {
        info: "test-local-storage"
    };
    const globalDatabaseFile = {
        url: "myfile",
        name: "test.csv",
        info: "test-database-storage"
    };
    const globalD3Dsv = [
        { time: "test-time-01", value: "test-value-01" },
        { time: "test-time-02", value: "test-value-02" },
        { time: "test-time-03", value: "test-value-03" },
        { time: "test-time-04", value: "test-value-04" }
    ];
    globalD3Dsv.columns = ["time", "value"];
    let chartIdCache = [], tableIdCache = [];
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
                .field("name", globalChart.name)
                .field("description", globalChart.description)
                .field("files", [
                    {
                        ...globalLocalFile,
                        scope: "bar.csv"
                    }, {
                        ...globalDatabaseFile,
                        file: {
                            columns: globalD3Dsv.columns,
                            data: globalD3Dsv
                        }
                    }].map(value => JSON.stringify(value))
                )
                .attach("attachment", path.resolve(__dirname, "fixtures/bar.csv"))
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    console.dir(res.body, { depth: null, colors: true });

                    const { id, Files, ...chart } = res.body;

                    chartIdCache.push(id);

                    assert.deepStrictEqual(chart, {
                        ...globalChart,
                        userId: 1,
                    });

                    Files.forEach(({ database, ...File }) => {
                        if (!!database) {
                            const { table, ...other } = database
                            tableIdCache.push(database.table);
                            assert.deepStrictEqual(other, {
                                columns: globalD3Dsv.columns,
                                data: [...globalD3Dsv]
                            });
                            assert.deepStrictEqual(File, {
                                ...globalDatabaseFile,
                                strategy: "database",
                                owner: id
                            });
                        } else {
                            assert.deepStrictEqual(File, {
                                ...globalLocalFile,
                                url: `static/${id}/Bar.csv`,
                                name: "Bar.csv",
                                strategy: "local",
                                owner: id
                            })
                        }
                    });
                    done();
                });
        });
    });
    describe("GET /:id", () => {
        it("should get a chart", done => {
            agent
                .get(`/${chartIdCache[0]}`)
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    console.dir(res.body, { depth: null, colors: true });

                    const { Files, ...chart } = res.body;

                    assert.deepStrictEqual(chart, {
                        ...globalChart,
                        id: chartIdCache[0],
                        userId: 1,
                    });

                    Files.forEach(({ database, ...File }) => {
                        if (!!database) {
                            assert.deepStrictEqual(database, {
                                columns: globalD3Dsv.columns,
                                data: [...globalD3Dsv],
                                table: tableIdCache[0]
                            });
                            assert.deepStrictEqual(File, {
                                ...globalDatabaseFile,
                                strategy: "database",
                                owner: chartIdCache[0]
                            });
                        } else {
                            assert.deepStrictEqual(File, {
                                ...globalLocalFile,
                                url: `static/${chartIdCache[0]}/Bar.csv`,
                                name: "Bar.csv",
                                strategy: "local",
                                owner: chartIdCache[0]
                            })
                        }
                    });

                    done();
                });
        });
    });
    describe("PUT /", () => {
        it("should update chart primary data", done => {
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

            agent
                .put("/")
                .field("id", chartIdCache[0])
                .field("name", "other-name")
                .field("files", [
                    {
                        operation: "insert",
                        scope: "foo.csv",
                        options: {
                            ...globalLocalFile
                        }
                    }, {
                        url: globalDatabaseFile.url,
                        operation: "modify",
                        options: {
                            file: {
                                columns: localD3Dsv.columns,
                                data: localD3Dsv
                            }
                        }
                    }].map(value => JSON.stringify(value))
                )
                .attach("attachment", path.resolve(__dirname, "fixtures/foo.csv"))
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);

                    assert.strictEqual(res.body, true);

                    done();
                });
        });
    });
    describe("DELETE /:id", () => {
        it("should remove a chart", done => {
            agent
                .delete(`/${chartIdCache[0]}`)
                .expect(200, done);
        });
    });
});
