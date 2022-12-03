const crypto = require("node:crypto");
const { User } = require("./model").models;

async function getUser(username, rawPassword) {
    const result = await User.findOne({
        where: { name: username },
        attributes: ["id", "name", "password", "scope"],
    });

    const hashPassword = crypto.createHash("md5")
        .update(result.name + rawPassword).digest("hex");

    return result.password === hashPassword ? (delete result.dataValues.password && result) : false;
}

async function trySaveUser(username, password) {
    const [result, created] = await User.findOrCreate({
        where: { name: username },
        defaults: {
            name: username,
            password: password
        }
    });

    if (created) {
        return result;
    } else {
        const hashPassword = crypto.createHash("md5")
            .update(username + password).digest("hex");

        return result.password === hashPassword ? (delete result.dataValues.password && result) : false;
    }
}

async function saveUser(username, password) {
    return await User.create({
        name: username,
        password: password
    });
}

async function updateUser(username, { password }) {
    const result = await User.update({
        password: password
    }, {
        where: {
            name: username
        }
    });

    return result.filter(Boolean).length > 0;
}

async function deleteUser(id) {
    // name is a unique key: update 1 -> success -> true, 0 -> fail -> false
    return Boolean(await User.destroy({
        where: {
            id: id
        }
    }));
}

module.exports = {
    getUser,
    trySaveUser,
    saveUser,
    updateUser,
    deleteUser
};
