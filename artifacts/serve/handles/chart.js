const fileHandle = require("../handles/file");
const sequelize = require("./model");

const { Chart, File } = sequelize.models;

/**
 * Get a chart by id. e.g. get chart by req query.
 * @param {number} id
 * @return {Promise<Model|boolean>}
 */
async function getChartById(id) {
    const result = await Chart.findByPk(id);

    return !!result ? result : false;
}

/**
 * Get a group of chart
 * @param {string} name
 * @param {number} limit
 * @param {[key:string,"DESC"|"ASC"|string][]|fn|col|literal} order
 * @return {Promise<Model[]|boolean>}
 */
async function getChart(name, limit, order) {
    const options = {
        order: order,
        limit: limit
    };

    const { count, rows } = await Chart.findAndCountAll({
        ...options,
        where: {
            name: name
        }
    });

    return count > 0 ? rows : false;
}

/**
 * Save a chart
 * @param {{id:string}} user
 * @param {{name:string,[info]:string,path:string,size:number}[]} files
 * @param {string} name
 * @param {string} [description]
 * @return {Promise<Model>}
 */
async function saveChart(user, files, name, description) {
    const chartResult = await Chart.create({
        name: name,
        description: description,
        userId: user.id
    });
    const filesResult = await Promise.all(files.map(async ({ path, name, size, info }) => {
        const saveFilesResult = await fileHandle.saveFile(path, name, size, info);
        return typeof saveFilesResult === "boolean" ? await File.findByPk(path) : saveFilesResult;
    }));
    await chartResult.addFile(filesResult);
    return await Chart.findByPk(chartResult.id, { include: File })
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
 * @param {object} data array only for files
 * @return {Promise<boolean>}
 */
async function updateChart(id, data) {
    const { files, ...other } = data; let result;

    if (Object.keys(data).length > 0) {
        const chartResult = await Chart.update(other, {
            where: {
                id: id
            }
        });
        result = chartResult.filter(Boolean).length > 0;
    }

    if (!!files) {
        // 1. save all files
        const filesResult = await Promise.all(files.map(async ({ path, name, size, info }) => {
            const saveFileResult = await fileHandle.saveFile(path, name, size, info);
            const checkedResult = typeof saveFileResult !== "boolean"
            return {
                check: checkedResult,
                file: checkedResult ? await File.findByPk(path) : saveFileResult
            }
        }));
        // 2. filter files which not new create
        const newRecord = filesResult.filter(value => value.check).map(value => value.file);
        // 3. bind new create to chart table
        await (await Chart.findByPk(id, { include: File })).addFile(newRecord);
        // 4. get all inner join char and file
        const { Files } = await Chart.findByPk(id, {
            include: {
                model: File,
                attributes: ["path"],
                include: Chart
            },
            attributes: []
        });
        // 5. filter not included and last one
        await Promise.all(Files.map(async file => { // target file which linked to chart
            if (!file.equalsOneOf(newRecord) && file.Charts.length === 1) {
               await file.destroy();
            }
        }));
        return result || filesResult.length > 0;
    } else {
        return result;
    }
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
    saveChart,
    updateChart,
    deleteChart
}
