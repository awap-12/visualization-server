const { File } = require("./model").models;
const { Op } = require("sequelize");

/**
 * Get a file by id, e.g.check if file exist when remove foreign key
 * @param {string} url
 * @return {Promise<Model|boolean>}
 */
async function getFileByUrl(url) {
    const result = await File.findByPk(url);

    return !!result ? result : false;
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
            [Op.or]: [
                {
                    name: {
                        [Op.like]: `%${search}%`
                    }
                },
                {
                    url: {
                        [Op.like]: `%${search}%`
                    }
                }
            ]
        },
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
    const { count, rows } = await File.findAndCountAll({ order: order, limit: limit });

    return count > 0 ? rows : false;
}

/**
 * Save a file, if file exist then update file data.
 * @param {string} url combine id of {@link Chart} with file name
 * @param {string} name
 * @param {number} size
 * @param {string} [info]
 * @param {boolean} [force] force update data (danger)
 * @return {Promise<Model|boolean>}
 */
async function saveFile(url, name, size, info, force = false) {
    const option = Object.entries({ name, size, info }).reduce((obj, [key, value]) => {
        if (!!value) obj[key] = value;
        return obj;
    }, {});

    const [result, created] = await File.findOrCreate({
        where: {
            url: url
        },
        defaults: {
            url, ...option
        }
    });

    return created ? result : force ? await updateFile(url, option) : false;
}

/**
 * Update file
 * @param {string} url
 * @param {object} data
 * @return {Promise<boolean>}
 */
async function updateFile(url, data) {
    const result = await File.update(data, {
        where: {
            url: url
        }
    });

    return result.filter(Boolean).length > 0;
}

/**
 * Delete a file
 * @param {string} url
 * @return {Promise<boolean>}
 */
async function deleteFile(url) {
    return Boolean(await File.destroy({
        individualHooks: true, // use hook
        where: {
            url: url
        }
    }));
}

module.exports = {
    getFileByUrl,
    getFile,
    findFile,
    saveFile,
    updateFile,
    deleteFile
};
