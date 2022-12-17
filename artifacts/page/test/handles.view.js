const sequelize = require("../handles/model");
const viewHandle = require("../handles/view");
const assert = require("node:assert");

const { User, Chart, ChartFile, File } = sequelize.models;

describe("view handle test", () => {
    before("database create", async () => {
        await sequelize.sync({ force: true });
        await User.create({ name: "test-name", password: "test-password" });
    });
    after("database clean", async () => sequelize.drop());
    describe("saveView test", () => {

    });
});
