const debug = require("debug")("route:file");
const fileHandle = require("../handles/file.js");
const express = require("express");

const router = express.Router();

router.get("/", async (req, res, next) => {
    try {
        const result = await fileHandle.getFile();

        res.status(200).json(!!result ? result.map(value => value.toJSON()) : result);
    } catch (err) {
        debug("get all method with error %o", err);
        next(err);
    }
});

module.exports = router;
