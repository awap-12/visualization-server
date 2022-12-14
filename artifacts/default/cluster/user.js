// This script is generated by bin/parse.js

const cluster = require("node:cluster");

module.exports = port => {
    const http = require("node:http");
    const app = require("user");

    const server = http.createServer(app);

    cluster.onEvent("clusterReady", () => {
        server.listen(port, () => {
            let addr = server.address();
            cluster.sendEvent("master:serverOnListen", { name: "user", addr });
        });
    });
};
