const debug = require("debug")("handle:file");
const storageHandle = require("../handles/storage");
const { typeFilter } = require("../utils/filter");
const sequelize = require("./model");
const { Op } = require("sequelize");

const { Chart, File, Local, Database } = sequelize.models;

/**
 * Get a file by id, e.g.check if file exist when remove foreign key
 * @param {string} url
 * @return {Promise<Model|boolean>}
 */
async function getFileByUrl(url) {
    return await storageHandle.getStorage(url);
}

/**
 * Get a group of files by searching
 * @param {string} search
 * @param {number} limit
 * @param {[key:string,"DESC"|"ASC"|string][]|fn|col|literal} order
 * @return {Promise<Model[]|boolean>}
 */
async function findFile(search, limit, order) {
    const { count, rows } = await File.findAndCountAll({
        where: {
            name: {
                [Op.like]: `%${search}%`
            }
        },
        include: [{
            attributes: { exclude: ["id"] },
            model: Local,
            as: "local"
        }, {
            attributes: { exclude: ["id"] },
            model: Database,
            as: "database"
        }],
        order: order,
        limit: limit
    });

    return count > 0 ? rows : false;
}

/**
 * TODO: Better to design some kind of ordering
 * @param {number} limit
 * @param {[key:string,"DESC"|"ASC"|string][]|fn|col|literal} order
 * @return {Promise<Model[]|boolean>}
 */
async function getFile(limit, order) {
    const { count, rows } = await File.findAndCountAll({
        include: [{
            attributes: { exclude: ["id"] },
            model: Local,
            as: "local"
        }, {
            attributes: { exclude: ["id"] },
            model: Database,
            as: "database"
        }],
        order: order,
        limit: limit
    });

    return count > 0 ? rows : false;
}

/**
 * Save a file with different strategy
 * @example
 * const result = await File.create({ url, strategy, ...data, [strategy]: { fileId: url, ...file } },{
 *     include: {
 *         model: sequelize.models[strategy.charAt(0).toUpperCase() + strategy.slice(1)],
 *         as: strategy
 *     }
 * });
 * @param {string} url combine id of {@link Chart} with file name
 * @param {"local"|"database"} [strategy]
 * @param {string|Array} [file]
 * @param {{name:string,info?:string,owner?:string}} options
 * @return {Promise<Model>}
 */
async function saveFile(url, { strategy = "local", file, ...data }) {
    switch (strategy) {
        case "local": {
            return await sequelize.transaction(async trans => {
                const result = await File.create({ url, strategy, ...data, local: { ...file, fileId: url }}, {
                    transaction: trans,
                    include: {
                        model: Local,
                        as: "local"
                    }
                });
                debug("saveFile - create file: %o", result.toJSON());
                return result;
            });
        }
        case "database": {
            return await sequelize.transaction(async trans => {
                const { name, columns, ...pureData } = file;
                const result = await File.create({ url, strategy, ...data, database: { table: name, columns: columns, fileId: url }}, {
                    transaction: trans,
                    include: {
                        model: Database,
                        as: "database"
                    }
                });
                await sequelize.models[result.database.table].bulkCreate(Object.values(pureData), { transaction: trans });
                debug("saveFile - create file: %o", result.toJSON());
                return result;
            });
        }
        default:
            throw new TypeError(`save file with type ${strategy} not supported`);
    }
}

/**
 * Update file, If want to switch to another strategy, need to use {@link storageHandle}.
 * @param {string} url
 * @param {"local"|"database"} [strategy]
 * @param {string|Array} [file]
 * @param {{url:string,name:string,info?:string,size?:number}} data
 * @return {Promise<boolean>}
 */
async function updateFile(url, { strategy, file, ...data }) {
    return sequelize.transaction(async (trans, result = []) => {
        if (Object.keys(data).length > 0) {
            const [updateResult] = await File.update(typeFilter({ strategy, ...data }), {
                individualHooks: true,
                transaction: trans,
                where: { url }
            });
            result.push(updateResult); // 1 or 0
        }

        if (!file) return Boolean(result[0]);

        const { strategy: currentStrategy, local, database } = await File.findByPk(url, {
            include: [
                { model: Local, as: "local" },
                { model: Database, as: "database" }
            ]
        });

        debug("get current file stage %o", (local ?? database).toJSON())

        if (!!strategy && strategy !== currentStrategy) {
            // switch strategy
            // 1. remove old file
            const dropResult = await sequelize.models[currentStrategy.replace(/^./, currentStrategy[0].toUpperCase())].destroy({
                transaction: trans,
                where: {
                    id: { local, database }[currentStrategy].id
                }
            });
            if (!Boolean(dropResult)) throw new Error("unable to remove old file");
            // 2. add new file
            result.push(await storageHandle.saveStorage(url, file, strategy));
            debug(`try drop old ${currentStrategy}: %s and add new ${strategy}`, Boolean(dropResult) ? "success" : "fail");
        } else {
            // use current strategy
            result.push(await storageHandle.updateStorage(url, file, currentStrategy));
            debug(`update current ${currentStrategy}`);
        }

        return result.filter(Boolean).length >= +!!file + +(Object.keys(data).length > 0);
    });
}

/**
 * Delete a file
 * @param {string} url
 * @return {Promise<boolean>}
 */
async function deleteFile(url) {
    return await storageHandle.deleteStorage(url);
}

module.exports = {
    getFileByUrl,
    getFile,
    findFile,
    saveFile,
    updateFile,
    deleteFile
};
