const { File } = require("./model").models;

/**
 * Get a file by id, e.g.check if file exist when remove foreign key
 * @param {number} id
 * @return {Promise<Model|boolean>}
 */
async function getFileByPath(id) {
    const result = await File.findByPk(id);

    return !!result ? result : false;
}

/**
 * Save a file
 * @param {string} path combine id of {@link Chart} with file name
 * @param {string} name
 * @param {number} size
 * @param {string} [info]
 * @return {Promise<Model|boolean>}
 */
async function saveFile(path, name, size, info) {
    const option = Object.entries({ name, size, info }).reduce((obj, [key, value]) => {
        if (!!value) obj[key] = value;
        return obj;
    }, {});

    const [result, created] = await File.findOrCreate({
        where: {
            path: path
        },
        defaults: {
            path, ...option
        }
    });

    return !created ? await updateFile(path, option) : result;
}

/**
 * Update file
 * @param {string} path
 * @param {object} data
 * @return {Promise<boolean>}
 */
async function updateFile(path, data) {
    const result = await File.update(data, {
        where: {
            path: path
        }
    });

    return result.filter(Boolean).length > 0;
}

/**
 * Delete a file
 * @param {string} path
 * @return {Promise<boolean>}
 */
async function deleteFile(path) {
    return Boolean(await File.destroy({
        individualHooks: true, // use hook
        where: {
            path: path
        }
    }));
}

module.exports = {
    getFileByPath,
    saveFile,
    updateFile,
    deleteFile
};
