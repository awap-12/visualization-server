const debug = require("debug")("handle:preview");
const { readFile } = require("node:fs/promises");
const { Preview } = require("./model").models;

/**
 * Find a preview based on chartId
 * @param chartId
 * @return {Promise<Promise<Model>|Promise<Model | null>|boolean>}
 */
async function getPreview(chartId) {
    const result = await Preview.findOne({
        where: {
            chartId: chartId
        }
    });

    debug("get preview %s", result.toJSON());

    return !!result ? result : false
}

/**
 * Save a preview based on chartId
 * @param {string} chartId
 * @param {string} mimetype
 * @param {string} path
 * @return {Promise<Model>}
 */
async function savePreview(chartId, { mimetype, path }) {
    return await Preview.create({
        type: mimetype,
        data: await readFile(path),
        chartId: chartId
    });
}

/**
 * Update a preview
 * @param {string} chartId
 * @param {string} mimetype
 * @param {string} path
 * @return {Promise<Model>}
 */
async function updatePreview(chartId, { mimetype, path }) {
    return Boolean(await Preview.update({ mimetype, path }, {
        where: {
            chartId: chartId
        }
    })[0]);
}

module.exports = {
    getPreview,
    savePreview,
    updatePreview
};
