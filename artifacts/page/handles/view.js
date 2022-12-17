const debug = require("debug")("handle:view");
const { typeFilter } = require("../utils/filter.js");
const { readFile } = require("node:fs/promises");
const sequelize = require("./model.js");

const { View, Preview, ViewChart, Chart } = sequelize.models;

/**
 * Find a view base on viewId
 * @param {string} id
 * @return {Promise<Model>}
 */
async function getViewById(id) {
    const result = await View.findOne({
        include: Chart,
        where: { id }
    });

    debug("getViewById - with id: %s return %o", id, result?.toJSON());

    return !!result ? result : false;
}

/**
 * Save a view by existed chart.
 * @param {string} userId
 * @param {"grid"|"flex"} display display style
 * @param {string} description
 * @param {string[]} charts charts id
 * @param {{mimetype:string,path:string}} file file structure from multer (req.file(s))
 * @return {Promise<Model>}
 */
async function saveView(userId, { display, description, charts, file }) {
    const { id } = await sequelize.transaction(async trans => {
        const [viewResult, chartsResult] = await Promise.all([
            View.create({
                display: display,
                description: description,
                preview: {
                    type: file.mimetype,
                    data: await readFile(file.path)
                },
                userId: userId
            }, {
                transaction: trans,
                include: {
                    model: Preview,
                    as: "preview"
                }
            }),
            Chart.findAll({
                where: {
                    id: charts
                }
            })
        ]);

        viewResult.addChart(chartsResult);

        return viewResult;
    });

    return await getViewById(id);
}

/**
 * Update view detail
 * @param {string} id
 * @param {string[]|string} [charts]
 * @param {{display?:string,description?:string}} [data]
 * @return {Promise<boolean>}
 */
async function updateView(id, { charts, ...data }) {
    return await sequelize.transaction(async (trans, result) => {
        if (Object.keys(data).length > 0) {
            const [updateResult] = await View.update(typeFilter(data), {
                transaction: trans,
                where: { id }
            });
            result = updateResult;
        }

        if (!charts) return Boolean(result);

        const [viewResult, chartsResult] = await Promise.all([
            View.findOne({
                transaction: trans,
                where: { id }
            }),
            Chart.findAll({
                transaction: trans,
                where: {
                    id: charts
                }
            }),
            ViewChart.destroy({
                transaction: trans,
                where: {
                    viewId: id
                }
            }),
        ]);

        viewResult.addChart(chartsResult);

        return true;
    });
}

/**
 * Remove a view
 * @param {string} id
 * @return {Promise<boolean>}
 */
async function deleteView(id) {
    return Boolean(await View.destroy({
        where: {
            id: id
        }
    }));
}

module.exports = {
    getViewById,
    saveView,
    updateView,
    deleteView
}
