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
    const result = await Chart.findByPk(id, { include: File });

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
    return await Chart.findByPk(chartResult.id, {
        include: {
            model: File,
            include: [
                {
                    attributes: {
                        exclude: ["id"]
                    },
                    model: Local,
                    as: "local"
                },
                {
                    attributes: {
                        exclude: ["id"]
                    },
                    model: Database,
                    as: "database"
                }
            ]
        }
    });
}

/**
 * Update chart
 *
 * when try to update files:
 * 1. we will resolve file in the routes and collect data to here
 * 2. do a loop
 * ```
 * used[] = collect dependence(files)
 * checked[] = empty
 * loop {
 *   if (target file exist)
 *     then should update
 *     checked.add(target file)
 *   else
 *     override and bind to chart
 *     checked.add(target file)
 * }
 * compare used and checked
 * clean linked old
 * ```
 * @param {string} id
 * @param {{
 *          url:string,
 *          operation?:"inserted"|"modified"|"deleted",
 *          options:{url:string,name:string,strategy?:string,info?:string,size?:number}
 *        }[]} [files]
 * @param {name:string,description:string} data array only for files
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
                case "inserted":
                    const exists = await fileHandle.getFileByUrl(url);
                    return typeof exists === "boolean" ? await fileHandle.saveFile(url, options) : true;
                case "modified": {
                    const { owner: currentOwner } = fileHandle.getFileByUrl(url);
                    if (id === currentOwner) {
                        // update by author
                        return await fileHandle.updateFile(url, options);
                    } else {
                        // transfer ownership
                        const chartResult = await getChartById(id);
                        const filesResult = await fileHandle.saveFile(url, { ...options, owner: id });
                        await chartResult.addFile(filesResult);
                        debug("save chart: %o, save file %o", chartResult.toJSON(), filesResult.toJSON());
                        return true;
                    }
                }
                case "deleted": {
                    const { owner: currentOwner } = fileHandle.getFileByUrl(url);
                    const count = await ChartFile.count({
                        where: {
                            [Op.and]: [
                                { chart_id: { [Op.ne]: id } },
                                { file_url: url }
                            ]
                        }
                    });
                    debug("%s chart use file: %s", count, url);
                    if (count <= 0) {
                        return await fileHandle.deleteFile(url);
                    } else {
                        // broke the relation
                        return await ChartFile.destroy({
                            where: {
                                [Op.and]: [
                                    { chart_id: id },
                                    { file_url: url }
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
