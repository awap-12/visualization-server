const express = require("express");
const cluster = require("node:cluster");

module.exports = port => {

    if (cluster.isSpawn) {
        const app = express();

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        
        app.listen(port);
    }
}
