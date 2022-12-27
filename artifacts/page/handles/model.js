const { sequelize } = require("server/handles/models");

const { NODE_ENV: nodeEnv } = process.env;

const productionModels = {
    Preview: require("../models/preview.js")(sequelize),
    View: require("../models/view.js")(sequelize)
};

const developmentModels = {
    /** page models */
    ...productionModels,
    /** Serve models */
    Chart: require("serve/models/chart.js")(sequelize),
    /** User models */
    User: require("user/models/user.js")(sequelize)
};

module.exports = sequelize.registerModels({
    models: {
        production: productionModels,
        development: developmentModels
    }[nodeEnv]
});
