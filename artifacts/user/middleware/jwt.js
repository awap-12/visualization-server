// TODO: A simple implement for use auth, remove this after oauth2 workflow down.
const config = require("server/config/token");
const jwt = require("jsonwebtoken");

/**
 * Generate token
 * @param {object} data object
 * @param {number} expire expire time
 * @return {Promise<array>}
 */
function sign(data, expire = 43200) {
    return Promise.resolve(jwt.sign(data, config.secret, {
        algorithm: config.algorithm,
        expiresIn: expire,
    }));
}

/**
 * Verify token
 * @param {object} options
 */
function verify(options = {}) {
    options = { ...config, ...options };
    return async (ctx, next) => {
        if (ctx.request.method === "OPTIONS" && "access-control-request-headers" in ctx.request.headers)
            if (ctx.request.headers["access-control-request-headers"].split(",").map(header => header.trim().toLowerCase()).includes("authorization"))
                return next();

        let token = options.resolveToken(req);

        if (!token) return next(new Error("No authorization token was found"));

        jwt.verify(token, options.secret, options, (err, decode) => {
            if (err) return next(new Error(`Invalid Token ${err.message}`));
            ctx.request[options.requestProperty] = decode;
            next();
        });
    }
}

module.exports = {
    sign,
    verify
}
