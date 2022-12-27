const debug = require("debug")("inject:user");

const { User } = require("./model.js").models;

module.exports = async () => {
    const user = await User.create({ name: "admin", password: "admin" });

    debug("add %o", user.toJSON());

    return user.toJSON();
};
