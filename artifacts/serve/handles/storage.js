const debug = require("debug")("handle:storage");
const sequelize = require("./model.js");
const utils = require("node:util");

const { File, Local, Database } = sequelize.models;

/**
 * Get a storage based on File Model
 * @param {string} url
 * @return {Promise<Model|boolean>}
 */
async function getStorage(url) {
    const result = await File.findByPk(url, {
        include: [{
            attributes: { exclude: ["id"] },
            model: Local,
            as: "local"
        }, {
            attributes: { exclude: ["id"] },
            model: Database,
            as: "database"
        }]
    });

    return !!result ? result : false;
}

/**
 * Save data
 * - in local case: binding path to Local table
 * - in database case: binding table name to Database table
 * @param {string} url should be "/static/{chartId}/{fileName}" which could sync front end design
 * @param {string|Array} data string -> local storage path; array -> d3 dsv format data
 * @param {"local"|"database"} type
 * @return {Promise<Model|Model[]>}
 */
async function saveStorage(url, data, type = "local") {
    switch (type) {
        case "local": {
            return await sequelize.transaction(async trans => {
                const result = await Local.create({ path: data, fileId: url }, { transaction: trans });
                debug("saveStorage - create local storage %o", result.toJSON());
                return result;
            });
        }
        case "database": {
            return await sequelize.transaction(async trans => {
                const { name, columns, ...pureData } = data;
                const result = await Database.create({ table: name, columns: columns, fileId: url }, { transaction: trans });
                await sequelize.models[result.table].bulkCreate(Object.values(pureData), { transaction: trans });
                debug("saveStorage - create database storage %o", result.toJSON());
                return result;
            });
        }
        default:
            throw new TypeError(`save storage with type ${type} not supported`);
    }
}

/**
 * Update storage resource
 * @param {string} url should be "/static/{chartId}/{fileName}" or "http://" which could sync front end design
 * @param {string|array} data string -> local storage path; array -> {row object{}, id, type(update/upsert)}[]
 * @param {"local"|"database"} type
 * @return {Promise<boolean>}
 */
async function updateStorage(url, data, type = "local") {
    switch (type) {
        case "local": {
            return await sequelize.transaction(async trans => {
                const [result] = await Local.update({path: data}, {
                    individualHooks: true,
                    transaction: trans,
                    where: {
                        fileId: url
                    }
                });
                debug("updateStorage - update local storage %o %s", data, !Boolean(result) ? "success" : "fail");
                return !Boolean(result); // if really updated, check hooks
            });
        }
        case "database": {
            // TODO: workflow, 1 -> update all, 2 -> upsert all
            const { id, table, columns: currentColumns } = await Database.findOne({
                attributes: ["id", "table", "columns"],
                where: {
                    fileId: url
                }
            });
            const { name, columns, ...pureData } = data;

            return await sequelize.transaction(async trans => {
                if (!!columns && !utils.isDeepStrictEqual(columns, currentColumns)) {
                    // If columns is not same, we should alter table. TODO: https://sequelize.org/docs/v6/other-topics/query-interface/
                    await Database.destroy({
                        individualHooks: true,
                        transaction: trans,
                        where: { id }
                    });
                    const { table } = await Database.create({ table: name, columns: columns, fileId: url }, { transaction: trans });
                    await sequelize.models[table].bulkCreate(Object.values(pureData), { transaction: trans });
                } else {
                    await sequelize.models[table].destroy({ transaction: trans, truncate: true });
                    await sequelize.models[table].bulkCreate(Object.values(pureData), { transaction: trans });
                }
                debug("updateStorage - update database storage %o", data);
                return true;
            });
        }
        default:
            throw new TypeError(`updateStorage - update storage with type ${type} not supported`);
    }
}

/**
 * Remove linked database or file.
 * @param {string} url
 * @return {Promise<boolean>}
 */
async function deleteStorage(url) {
    return Boolean(await File.destroy({
        individualHooks: true,
        where: { url }
    }));
}

module.exports = {
    getStorage,
    saveStorage,
    updateStorage,
    deleteStorage
};
