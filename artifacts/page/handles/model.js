const { NODE_ENV: nodeEnv } = process.env;

function development() {
    const { sequelize } = require("server/handles/model.js");

    const models = {
        /** page models */
        Preview: require("../models/preview.js")(sequelize),
        View: require("../models/view.js")(sequelize),
        /** Serve models */
        Chart: require("serve/models/chart.js")(sequelize),
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
