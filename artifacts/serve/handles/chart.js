const debug = require("debug")("handle:chart")
const fileHandle = require("../handles/file");
const sequelize = require("./model");
const { Op } = require("sequelize");

const { Chart, ChartFile, File, Local, Database } = sequelize.models;

/**
 * Get a chart by id. e.g. get chart by req query.
 * @param {string} id
 * @return {Promise<Model|boolean>}
 */
async function getChartById(id) {
    const result = await Chart.findByPk(id, {
        include: {
            model: File,
            include: [{
                attributes: { exclude: ["id"] },
                model: Local,
                as: "local"
            }, {
                attributes: { exclude: ["id"] },
                model: Database,
                as: "database"
            }]
        }
    });

    return !!result ? result : false;
}

/**
 * Get a group of chart
 * @param {string} search
 * @param {number} [limit]
 * @param {[key:string,"DESC"|"ASC"|string][]|fn|col|literal} [order]
 * @return {Promise<Model[]|boolean>}
 */
async function findChart(search, limit, order) {
    const { count, rows } = await Chart.findAndCountAll({
        where: {
            name: {
                [Op.like]: `%${search}%`
            }
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
async function getChart(limit, order) {
    const { count, rows } = await Chart.findAndCountAll({ order: order, limit: limit });

    return count > 0 ? rows : false;
}


/**
 * Create a chart
 * @param {string} user
 * @param {string} name
 * @param {string} [description]
 * @return {Promise<Model>}
 */
async function createChart(user, name, description) {
    return await Chart.create({
        name: name,
        description: description,
        userId: user
    });
}

/**
 * Save a chart
 * @param {string} user
 * @param {{url:string,name:string,strategy?:string,info?:string,size:number,file:object}[]} files
 * @param {string} name
 * @param {string} [description]
 * @return {Promise<Model>}
 */
async function saveChart(user, files, name, description) {
    const chartResult = await createChart(user, name, description);
    // 1. save all files
    const filesResult = await Promise.all(files.map(async ({ url, ...options}) => {
        const exists = await fileHandle.getFileByUrl(url);
        return typeof exists === "boolean" ? await fileHandle.saveFile(url, { ...options, owner: chartResult.id }) : exists;
    }));
    debug("save chart: %o, save file %o", chartResult.toJSON(), filesResult.map(value => value.toJSON()));
    // 3. bind new create to chart table
    await chartResult.addFile(filesResult);
    // 4. get full image of chart.
    return await getChartById(chartResult.id);
}

/**
 * Update chart
 *
 * when operation is `insert`:
 *   either url or options.url required for search or create a file.
 *   options have to include file data in options meet {@link saveFile} structure.
 *
 * when operation is `modify`:
 *   url is old target
 *   options have to include a new url
 *
 * when operation is `delete`:
 *   no options data require
 *
 * @param {string} id chart id
 * @param {{
 *          url:string,
 *          operation?:"insert"|"modify"|"delete",
 *          options?:{url:string,name:string,strategy?:string,info?:string,file:object}
 *        }[]} [files]
 * @param {name:string,description:string} data array only for chart
 * @return {Promise<boolean>}
 */
async function updateChart(id, { files, ...data }) {
    let result = [];

    if (Object.keys(data).length > 0)
        result.push((await Chart.update(data, {
            where: {
                id: id
            }
        }))[0]);

    if (Array.isArray(files)) {
        result.push(...(await Promise.all(files.map(async ({ url, operation, options }) => {
            switch (operation) {
                case "insert":
                    const chartResult = await getChartById(id);
                    const exists = await fileHandle.getFileByUrl(url ?? options.url);
                    const filesResult = typeof exists === "boolean" ? await fileHandle.saveFile(url ?? options.url, { ...options, owner: id }) : exists;
                    await chartResult.addFile(filesResult);
                    debug("updateChart - save %s and get %o", url, filesResult.toJSON());
                    return true;
                case "modify": {
                    const { owner: currentOwner } = fileHandle.getFileByUrl(url);
                    if (id === currentOwner) {
                        // update by author
                        debug("updateChart - update file %s with options", url, options);
                        return await fileHandle.updateFile(url, options);
                    } else {
                        // transfer ownership
                        // 1. fork other's file -> create new file based on chart id
                        const chartResult = await getChartById(id);
                        const exists = await fileHandle.getFileByUrl(options.url);
                        const filesResult = typeof exists === "boolean" ? await fileHandle.saveFile(options.url, { ...options, owner: id }) : exists;
                        // 2. bind old url to the new url
                        await ChartFile.update({ fileUrl: filesResult.url }, {
                            where: {
                                [Op.and]: [
                                    { chartId: id },
                                    { fileUrl: url }
                                ]
                            }
                        });
                        debug("updateChart - save file %o", filesResult.toJSON());
                        // 3. check old file relationship, trigger remove if not exist
                        const count = await ChartFile.count({
                            where: {
                                fileUrl: url
                            }
                        });
                        return count <= 0 ? await fileHandle.deleteFile(url) : true;
                    }
                }
                case "delete": {
                    const count = await ChartFile.count({
                        where: {
                            [Op.and]: [
                                { chartId: { [Op.ne]: id } },
                                { fileUrl: url }
                            ]
                        }
                    });
                    if (count <= 0) {
                        debug("updateChart - remove file: %s", url);
                        return await fileHandle.deleteFile(url);
                    } else {
                        // broke the relation
                        debug("updateChart - remove link only: %d chart use file: %s", count, url);
                        return await ChartFile.destroy({
                            where: {
                                [Op.and]: [
                                    { chartId: id },
                                    { fileUrl: url }
                                ]
                            }
                        });
                    }
                }
                default:
                    throw new Error("unknown file operation");
            }
        }))));
    }

    return result.filter(Boolean).length > 0;
}

/**
 * Delete a chart
 * @param {string} id
 * @return {Promise<boolean>}
 */
async function deleteChart(id) {
    return Boolean(await Chart.destroy({
        individualHooks: true, // use hook
        where: {
            id: id
        }
    }));
}

module.exports = {
    getChartById,
    getChart,
    findChart,
    createChart,
    saveChart,
    updateChart,
    deleteChart
}
