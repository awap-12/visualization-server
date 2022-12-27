const { sequelize } = require("server/handles/models");

const { NODE_ENV: nodeEnv } = process.env;

const productionModels = {
    Chart: require("../models/chart.js")(sequelize),
    File: require("../models/file.js")(sequelize),
    Local: require("../models/storage/local.js")(sequelize),
    Database: require("../models/storage/database.js")(sequelize)
};

const developmentModels = {
    /** page models */
    ...productionModels,
    /** User models */
    User: require("user/models/user.js")(sequelize)
};

module.exports = sequelize.registerModels({
    models: {
        production: productionModels,
        development: developmentModels
    }[nodeEnv]
});
