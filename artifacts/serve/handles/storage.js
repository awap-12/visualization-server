const debug = require("debug")("handle:storage");
const sequelize = require("./model");
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
        case "local":
            return await Local.create({ path: data, fileId: url });
        case "database":
            return await sequelize.transaction(async trans => {
                const { name, columns, ...pureData } = data;
                const result = await Database.create({ table: name, columns: columns, fileId: url }, { transaction: trans });
                await sequelize.models[result.table].bulkCreate(Object.values(pureData), { transaction: trans });
                return result;
            });
        default:
            throw new TypeError(`save storage with type ${type} not supported`);
    }
}

/**
 * Update storage resource
 * @param {string} url should be "/static/{chartId}/{fileName}" which could sync front end design
 * @param {string|array} data string -> local storage path; array -> {row object{}, id, type(update/upsert)}[]
 * @param {"local"|"database"} type
 * @return {Promise<boolean>}
 */
async function updateStorage(url, data, type = "local") {
    switch (type) {
        case "local":
            try {
                await Local.update({ path: data }, {
                    individualHooks: true,
                    where: {
                        fileId: url
                    }
                });

                return true;
            } catch (err) {
                debug("updateStorage - update %o", err);
                return false;
            }
        case "database":
            // workflow, 1 -> update all, 2 -> upsert all
            try {
                const { id, table, columns: currentColumns } = await Database.findOne({
                    attributes: ["id", "table", "columns"],
                    where: {
                        fileId: url
                    }
                });
                const { columns, ...pureData } = data;

                if (!!columns && !utils.isDeepStrictEqual(columns, currentColumns)) {
                    await Database.destroy({
                        individualHooks: true,
                        where: {
                            id: id
                        }
                    });
                    await saveStorage(url, data, "database");
                } else {
                    await sequelize.transaction(async trans => {
                        await sequelize.models[table].destroy({ transaction: trans, truncate: true });
                        await sequelize.models[table].bulkCreate(Object.values(pureData), { transaction: trans });
                    });
                }

                return true;
            } catch (err) {
                debug("updateStorage - update %o", err);
                return false;
            }
        default:
            throw new TypeError(`save storage with type ${type} not supported`);
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
        where: {
            url: url
        }
    }));
}

module.exports = {
    getStorage,
    saveStorage,
    updateStorage,
    deleteStorage
};
