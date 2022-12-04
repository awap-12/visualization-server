const camelCase = require("camelcase");
const express = require("express");
const multer = require("multer");
const path = require("node:path");

const STATIC_ROOT = path.resolve(__dirname, "..", "tmp");

const upload = multer({
    storage: multer.diskStorage({
        destination: STATIC_ROOT,
        filename(req, file, callback) {
            let { name, ext } = path.parse(file.originalname);
            callback(null, camelCase(name, { pascalCase: true }) + ext);
        }
    })
});

const router = express.Router();

router.get("/:id", (req, res) => {
    const { id } = req.params;


});

/**
 * 1. should save files
 * 2. should calculate target folder
 * 3. should get f
 * 4. should move files
 */
router.post("/", upload.array("attach"), (req, res) => {
    //const { name, description, files, user } = req.body;
    const { attach } = req.files;
    res.status(200)
});

module.exports = router;
