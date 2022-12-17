// inject have to be registered in correct order!
// consider improve the structure.

const sequelize = require("./model");

const { User } = sequelize.models;

const serveInject = require("serve/handles/inject");

/**
 * Inject everything.
 * @return {Promise<void>}
 */
module.exports = async () => {
    await sequelize.authenticate();

    const { id } = await User.create({ name: "admin", password: "admin" });

    await serveInject(id);
};
