const debug = require("debug")("handle:proxy");
const config = require("./worker");

const proxy = require("http-proxy").createProxyServer();

/**
 * Create proxy server
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */
module.exports = function (req, res) {
    const path = req.url, rules = config.rules;

    function getTarget(prefix) {
        const rule = rules[prefix], target = rule.address[rule.balancer.pick()];
        debug("balanced target %o", target);
        return target;
    }

    let target = getTarget("default");

    for (const pathPrefix in rules) {
        const pathEndSlash = pathPrefix.slice(-1)  === "/";
        const testPrefixMatch = new RegExp(pathEndSlash ? pathPrefix : `(${pathPrefix})(?:\\W|$)`).exec(path);

        if (testPrefixMatch && testPrefixMatch.index === 0) {
            req.url = path.replace(testPrefixMatch[pathEndSlash ? 0 : 1], '');

            target = getTarget(pathPrefix);

            for (let i = 0; i < testPrefixMatch.length; i++)
                target = target.replace("$" + i, testPrefixMatch[i + (pathEndSlash ? 0 : 1)]);

            break;
        }
    }

    proxy.web(req, res, { target });
};
