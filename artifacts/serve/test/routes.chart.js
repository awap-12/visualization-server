const request = require("supertest");
const sequelize = require("../handles/model");
const express = require("express");
const chartRoute = require("../routes/chart");
const path = require("node:path");

const { User } = sequelize.models;

describe("chart route test", () => {
    const app = express();

    app.use("/", chartRoute);

    const agent = request.agent(app);
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.bulkCreate([{ name: "test-name", password: "test-password" }]);
    });
    after("database clean", async () => sequelize.drop());
    describe("POST /", () => {
        it("should create a view", done => {
            agent
                .post("/")
                .attach("attach", path.resolve(__dirname, "fixtures/index.html"))
                .expect(200, done);
        });
    });
});
