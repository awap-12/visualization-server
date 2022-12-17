const debug = require("debug")("route:view");
const viewHandle = require("../handles/view.js");
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

        const result = await viewHandle.getViewById(id);
        if (!result) next(new Error("view not exists"));

        res.status(200).json(result);
    } catch (err) {
        debug("get method params: %o with error %o", req.params, err);
        next(err);
    }
});

router.post("/", upload.single("preview"), async (req, res, next) => {
    try {
        const { id, display, charts, description } = req.body;

        const result = await viewHandle.saveView(id, { display, description, charts, file: req.file });

        res.status(200).json(result.toJSON());
    } catch (err) {
        debug("post method body: %o; file: %o with error %o", req.body, req.file, err);
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { id, display, charts, description } = req.body;

        const result = await viewHandle.updateView(id, { display, description, charts });

        res.status(200).send(result);
    } catch (err) {
        debug("post method body: %o; file: %o with error %o", req.body, req.file, err);
        next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await viewHandle.deleteView(id);

        res.status(200).send(result);
    } catch (err) {
        debug("delete method params: %o with error %o", req.params, err);
        next(err);
    }
});

module.exports = router;
