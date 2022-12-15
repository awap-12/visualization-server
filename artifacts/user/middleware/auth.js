const { Request, Response } = require("oauth2-server");
const oauthHandle = require("../handles/oauth");

module.exports = (options = {}) => {
    return async function (ctx, next) {
        const request = new Request({
            headers: { authorization: ctx.request.headers.authorization },
            method: ctx.request.method,
            query: ctx.request.query,
            body: ctx.request.body
        });
        const response = new Response(ctx.response);

        try {
            // Request is authorized.
            ctx.req.user = await oauthHandle.authenticate(request, response, options);
            next();
        } catch (err) {
            // Request is not authorized.
            ctx.status = err.code || 500;
            ctx.body = err;
            throw err;
        }
    }
};
