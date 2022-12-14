const serverConfig = require("server/config/service");
const Balancer = require("../utils/balancer");
const workersCache = {}, rulesCache = {};

const { SERVER_HOST: host = "localhost" } = process.env;

const config = {
    ...serverConfig, // no need deep copy
    get workers() {
        return workersCache;
    },
    get rules() {
        return rulesCache;
    },
    set rules([server, port]) {
        const prefix = serverConfig[server].prefix;
        if (prefix in rulesCache) {
            const rule = rulesCache[prefix];
            rule.address.push(`http://${host}:${port}`);
            rule.balancer = new Balancer(rule.address.length);
        } else {
            rulesCache[prefix] = {
                address: [`http://${host}:${port}`],
                balancer: {
                    pick() {
                        return 0;
                    }
                }
            };
        }
    }
};

for (const [key, { port, maxForks }] of Object.entries(config)) {
    if (key === "workers" || key === "rules") continue;
    workersCache[key] = {
        maxForks: maxForks ?? 0,
        params: [port ?? 0]
    };
}

module.exports = config;
module.exports.config = config;
