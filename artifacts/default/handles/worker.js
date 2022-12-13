const debug = require("debug")("config:server");
const serverConfig = require("../../../config/cluster");
const workersCache = {}, rulesCache = {};

const config = {
    ...serverConfig, // no need deep copy
    get workers() {
        return workersCache;
    },
    get rules() {
        return rulesCache;
    }
};

for (const [key, value] of Object.entries(config)) {
    if (key === "workers" || key === "rules") continue;
    workersCache[key] = { maxForks: value.maxForks, params: [value.port] };
    rulesCache[value.prefix] = `http://localhost:${value.port}`;
}

debug("rules: %o; workers: %o", config.rules, config.workers);

module.exports = config;
module.exports.config = config;
