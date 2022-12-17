const {sequelize} = require("../../../handles/model");
const { NODE_ENV: nodeEnv } = process.env;

function development() {
    const { sequelize } = require("server/handles/model.js");

    const models = {
        /** Serve models */
        Chart: require("serve/models/chart")(sequelize),
        File: require("serve/models/file")(sequelize),
        Local: require("serve/models/storage/local")(sequelize),
        Database: require("serve/models/storage/database")(sequelize),
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
module.exports = {
    production: require("server/handles/model.js"),
    development: development()
}[nodeEnv];
