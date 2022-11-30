const express = require("express");
const compression = require("compression");
const path = require("node:path");
const cluster = require("node:cluster");

module.exports = port => {
    if (cluster.isSpawn) {
        const app = new express();

        app.use(compression());

        app.use("/dataset", express.static(path.resolve(__dirname, "static")));

        app.listen(port);
    }
}
