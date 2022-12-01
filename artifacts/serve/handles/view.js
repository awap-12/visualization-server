const {or} = require("sequelize");
const { View } = require("./model").models;

/**
 * Get a view by id. e.g. get view by req query.
 * @param id
 * @return {Promise<any>}
 */
async function getViewById(id) {
    return await View.findByPk(id);
}

/**
 * Get a group of view
 * @param name
 * @param limit
 * @param order
 * @return {Promise<Model[]|false>}
 */
async function getView(name, limit, order) {
    const options = {
        order: order,
        limit: limit
    };

    const { count, rows } = await View.findAndCountAll({
        ...options,
        where: {
            name: name
        }
    });

    return count > 0 ? rows : false;
}

/**
 * Save a view
 * @param {id:string} user
 * @param {string} name
 * @param {string} description
 * @param {string[]|string} files
 * @return {Promise<Model>}
 */
async function saveView(user, name, description, files) {
    return await View.create({
        name: name,
        description: description,
        files: files,
        userId: user.id
    });
}

async function deleteView(id) {
    return await View.destroy({
        where: {
            id: id
        }
    });
}

module.exports = {
    getViewById,
    saveView,
    deleteView
}
