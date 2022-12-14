const debug = require("debug")("route:preview");
const chartHandle = require("../handles/preview");
const express = require("express");
const multer = require("multer");

const upload = multer({
    fileFilter: (req, file, callback) => {
        callback(null, file.mimetype.startsWith("image"));
    },
    storage: multer.diskStorage({
        // destination: os.tmpdir()
        filename: (req, file, callback) => {
            callback(null, `${Date.now()}-${file.originalname}`);
        }
    })
});

const router = express.Router();

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await chartHandle.getPreview(id);

        res.status(200).json(!!result ? result.toJSON() : false);
    } catch (err) {
        debug("get method params: %o with error %o", req.params, err);
        next(err);
    }
});

router.post("/:id", upload.single("preview"), async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await chartHandle.savePreview(id, req.file);

        res.status(200).send(result.toJSON());
    } catch (err) {
        debug("post method params: %o with error %o", req.params, err);
        next(err);
    }
});

router.put("/:id", upload.single("preview"), async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await chartHandle.updatePreview(id, req.file);

        res.status(200).send(result);
    } catch (err) {
        debug("put method params: %o with error %o", req.params, err);
        next(err);
    }
});

module.exports = router;
