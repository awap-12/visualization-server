const sequelize = require("server/handles/model.js");

const { NODE_ENV: nodeEnv } = process.env;

const isDev = nodeEnv === "development";

function development({ sequelize }) {

    const models = {
        /** Serve models */
        Chart: require("../models/chart.js")(sequelize),
        File: require("../models/file.js")(sequelize),
        Local: require("../models/storage/local.js")(sequelize),
        Database: require("../models/storage/database.js")(sequelize),
        /** User models */
        User: require("user/models/user.js")(sequelize)
    }

    for (const name in models) {
        if ("associate" in models[name]) {
            models[name].associate(models)
        }
    }

    return sequelize;
}

/** @type Sequelize */
module.exports = isDev ? development(sequelize): sequelize;
