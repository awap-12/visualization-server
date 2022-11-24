const express = require("express");
const cluster = require("node:cluster");

module.exports = port => {

    if (cluster.isSpawn) {
        const app = express();

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        app.post("/", (req, res) => {
            res.send(`DATA-FROM-B And Get Receive: ${JSON.stringify(req.body)}`);
        });

        app.listen(port);
    }
}
