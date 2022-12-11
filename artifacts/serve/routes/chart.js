const debug = require("debug")("route:chart");
const chartHandle = require("../handles/chart");
const camelCase = require("camelcase");
const express = require("express");
const multer = require("multer");
const { extname, resolve, parse, posix } = require("node:path");

const TEMP = resolve(__dirname, "..", "tmp");

const upload = multer({
    fileFilter: (req, file, callback) => {
        const acceptableMime = [".csv", ".dsv", ".tsv"];
        callback(null, acceptableMime.includes(extname(file.originalname)));
    },
    storage: multer.diskStorage({
        destination: TEMP,
        filename(req, file, callback) {
            let { name, ext } = parse(file.originalname);
            const pascalCaseName = camelCase(name, { pascalCase: true });
            callback(null, pascalCaseName + ext);
        }
    })
});

const router = express.Router();

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await chartHandle.getChartById(id);

        res.status(200).json(await normalizeChartData(result.toJSON()));
    } catch (err) {
        debug("get method params: %o with error %o", req.params, err);
        next(err);
    }

});

router.post("/", upload.array("attachment"), async (req, res, next) => {
    try {
        let { id, name, description, files = [] } = req.body;

        // TODO: is it possible to handle multipart by express json middleware?
        files = await Promise.all(files.map(async file => typeof file === "string" ? JSON.parse(file) : file ?? {}));
        debug("resolve body: id: %d; name: %s; description: %s; files: %o;", id, name, description, files);

        const chartResult = await chartHandle.createChart(id, { name, description });

        files = await Promise.all(files.map(async ({ scope, url, name, info, file = {} }) => {
            const fileInfo = ("data" in file && "columns" in file) ? file : req.files.find(({ originalname }) => originalname === scope)
            return await normalizeFile(chartResult.id, url, name, info, fileInfo);
        }));

        debug("format file structure: %o", files);

        let result = await chartHandle.saveChart(id, files, chartResult.id);

        res.status(200).json(await normalizeChartData(result.toJSON()));
    } catch (err) {
        debug("post method body: %o, file: %o with error %o", req.body, req.files, err);
        next(err);
    }
});

router.put("/", upload.array("attachment"), async (req, res, next) => {
    try {
        let { id, name, description, files = [] } = req.body;

        // TODO: is it possible to handle multipart by express json middleware?
        files = await Promise.all(files.map(async file => typeof file === "string" ? JSON.parse(file) : file ?? {}));
        debug("resolve body: id: %s; name: %s; description: %s; files: %o;", id, name, description, files);

        files = await Promise.all(files.map(async ({ scope, operation, url, options }) => {
            if (operation === "delete" ) {
                return { operation, url };
            } else {
                const { name, info, file = {} } = options;
                const fileInfo = ("data" in file && "columns" in file) ? file : req.files.find(({ originalname }) => originalname === scope)
                return {
                    operation, url,
                    options: await normalizeFile(id, options.url, name, info, fileInfo)
                };
            }
        }));

        debug("format file structure: %o", files);

        const result = await chartHandle.updateChart(id, { files, name, description });

        res.status(200).send(result);
    } catch (err) {
        debug("put method params: %o, body: %o, file: %o with error %o", req.params, req.body, req.files, err);
        next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await chartHandle.deleteChart(id);

        res.status(200).send(result)
    } catch (err) {
        debug("delete method params: %o with error %o", req.params, err);
        next(err);
    }
});

async function normalizeFile(chartId, url, name, info, { data, columns, path, filename }) {
    if (!!filename || !!name) url ??= posix.join("static", chartId, filename ?? name);
    if (!!data && !!columns) {
        // database storage strategy
        const dataSet = data; dataSet.columns = columns;
        return { url, name, info, file: dataSet, strategy: "database" };
    } else if (!!path && !!filename) {
        // scope file attached, use local storage strategy
        return { url, name: name ?? filename, info, file: { path }, strategy: "local" };
    } else throw new TypeError("unknown storage type");
}

/**
 * remove unused
 * @param {object} result
 * @return {Promise<object>}
 */
async function normalizeChartData(result) {
    return {
        ...result,
        Files: await Promise.all(result.Files.map(async value => {
            if ("local" in value)
                delete value.local;
            if ("ChartFile" in value)
                delete value.ChartFile;
            if (!!value.database) {
                value.database.data = (await value.database.data).map(value => value.toJSON());
                delete value.database.fileId;
            } else delete value.database;
            return value;
        }))
    }
}

module.exports = router;
