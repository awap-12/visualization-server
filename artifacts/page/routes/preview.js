const debug = require("debug")("route:preview");
const previewHandle = require("../handles/preview.js");
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

        const result = await previewHandle.getPreview(id);
        if (!result) next(new Error("preview file not exists"));

        const { type, data } = result;

        res.contentType(type);
        res.status(200).send(data);
    } catch (err) {
        debug("get method params: %o with error %o", req.params, err);
        next(err);
    }
});

router.post("/:id", upload.single("preview"), async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await previewHandle.savePreview(id, req.file);

        res.status(200).send(result.toJSON());
    } catch (err) {
        debug("post method params: %o with error %o", req.params, err);
        next(err);
    }
});

router.put("/:id", upload.single("preview"), async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await previewHandle.updatePreview(id, req.file);

        res.status(200).send(result);
    } catch (err) {
        debug("put method params: %o with error %o", req.params, err);
        next(err);
    }
});

module.exports = router;
