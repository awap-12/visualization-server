const debug = require("debug")("config:server");
const workersCache = {}, rulesCache = {};

const config = {
    "serve": {
        prefix: "default",
        maxForks: "2",
        port: 8686
    },
    "member-a": {
        prefix: "/api/memberA",
        maxForks: "1",
        port: 8687
    },
    "member-b": {
        prefix: "/api/memberB",
        maxForks: "1",
        port: 8688
    },
    "user": {
        prefix: "/api/user",
        maxForks: "1",
        port: 8689
    },
    get workers() {
        return workersCache;
    },
    get rules() {
        return rulesCache;
    }
}

for (const [key, value] of Object.entries(config)) {
    if (key === "workers" || key === "rules") continue;
    workersCache[key] = { maxForks: value.maxForks, params: [value.port] };
    rulesCache[value.prefix] = `http://localhost:${value.port}`;
}

debug("rules: %o; workers: %o", config.rules, config.workers);

module.exports = config;
module.exports.config = config;
