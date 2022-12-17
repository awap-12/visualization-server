const { readFile } = require("node:fs/promises");
const { Preview } = require("./model").models;

/**
 * Find a preview based on view id
 * @param {string} viewId view id
 * @return {Promise<Model|boolean>}
 */
async function getPreview(viewId) {
    const result = await Preview.findOne({
        where: {
            viewId: viewId
        }
    });

    return !!result ? result : false;
}

/**
 * Save a preview based on view id, a preview file must be required type and data.
 * @param {string} viewId view id
 * @param {string} mimetype file mimetype
 * @param {string} path file path
 * @return {Promise<Model>}
 */
async function savePreview(viewId, { mimetype, path }) {
    return await Preview.create({
        type: mimetype,
        data: await readFile(path),
        viewId: viewId
    });
}

/**
 * Update a preview, a preview file must be required type and data.
 * @param {string} viewId view id
 * @param {string} mimetype file mime type
 * @param {string} path file path
 * @return {Promise<boolean>}
 */
async function updatePreview(viewId, { mimetype, path }) {
    const [result] = await Preview.update({
        type: mimetype,
        data: await readFile(path)
    }, {
        where: {
            viewId: viewId
        }
    });

    return Boolean(result);
}

module.exports = {
    getPreview,
    savePreview,
    updatePreview
};
