const camelCase = require("camelcase");
const express = require("express");
const multer = require("multer");
const path = require("node:path");
const chartHandle = require("../handles/chart");
const fileHandle = require("../handles/file");
const { move } = require("../utils/file");

const ROOT = path.resolve(__dirname, "..");
const TEMP = path.resolve(__dirname, "..", "tmp");

const upload = multer({
    fileFilter: (req, file, callback) => {
        const acceptableMime = [".csv", ".dsv", ".tsv"];
        callback(null, acceptableMime.includes(path.extname(file.originalname)));
    },
    storage: multer.diskStorage({
        destination: TEMP,
        filename(req, file, callback) {
            let { name, ext } = path.parse(file.originalname);
            const pascalCaseName = camelCase(name, { pascalCase: true });
            callback(null, pascalCaseName + ext);
        }
    })
});

const router = express.Router();

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await chartHandle.getChartById(id);

        res.status(200).json(result.toJSON());
    } catch (err) {
        res.status(500).send(err.code);
    }

});

/**
 * 1. should save files
 * 2. should calculate target folder
 * 3. should get f
 * 4. should move files
 */
router.post("/", upload.array("attachment"), async (req, res) => {
    try {
        let { name, description, id, files = [] } = (req.body || {});

        if (req.files?.length < 1) throw new Error("no file attach");

        const chartResult = await chartHandle.createChart(id, name, description);
        const filesResult = await Promise.all(req.files.map(async (file, index) => {
            files[index] = typeof files[index] === "string" ? JSON.parse(files[index]) :
                           typeof files[index] === "object" ? files[index] : {};
            const { name = file.filename, info } = files[index];

            const url = path.posix.join("static", chartResult.id, file.filename);

            const saveFileResult = await fileHandle.saveFile(url, name, file.size, info);
            if (!!saveFileResult) await move(file.path, path.join(ROOT, url));
            return !saveFileResult ? fileHandle.getFileByUrl(url) : saveFileResult;
        }));

        await chartResult.addFile(filesResult);

        const result = await chartHandle.getChartById(chartResult.id);
        if (!result) throw new Error("unexpected behaviour");

        res.status(200).json(result.toJSON());
    } catch (err) {
        res.status(500).send(err.code);
    }
});

module.exports = router;
