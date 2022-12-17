const debug = require("debug")("handle:view");
const { readFile } = require("node:fs/promises");
const sequelize = require("./model");

const { View, Preview, ViewChart, Chart } = sequelize.models;

/**
 * Find a view base on viewId
 * @param {string} viewId
 * @return {Promise<Model>}
 */
async function getViewById(viewId) {
    const result = await View.findOne({
        where: {
            viewId: viewId
        },
        include: Chart
    });

    return !!result ? result : false;
}

/**
 * Save a view by existed chart.
 * @param {string} uerId
 * @param {"grid"|"flex"} display display style
 * @param {string} description
 * @param {string[]} charts charts
 * @param {{mimetype:string,path:string}} file file structure from multer (req.file(s))
 * @return {Promise<Model>}
 */
async function saveView(uerId, { display, description, charts, file }) {
    const result = await sequelize.transaction(async trans => {
        const [viewResult, ...chartsResult] = await Promise.all([
            View.create({
                display,
                description,
                preview: {
                    type: file.mimetype,
                    data: await readFile(file.path)
                },
                userId: uerId
            }, {
                transaction: trans,
                include: Preview,
                as: "preview"
            }),
            ...charts.map(chart => ViewChart.findById(chart, { transaction: trans }))
        ]);

        viewResult.addChart(chartsResult);

        return viewResult;
    });

    return await getViewById(result.id);
}

module.exports = {
    getViewById,
    saveView,
}
