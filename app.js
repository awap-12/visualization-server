const debug = require("debug")("server");
const config  = require("./config/server.js");
const thread = require("./thread.js")(__filename);
const cluster = require("node:cluster");

if (cluster.isMain) {
    cluster.onEvent(thread.EV_ERROR, (ev, error) => {
        debug("error event received %s", error);
        process.exit();
    });
}

thread.start(config.workers);
