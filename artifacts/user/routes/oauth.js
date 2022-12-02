const { Request, Response } = require("oauth2-server");
const Router = require("koa-router");
const oauth = require("../handles/oauth");

const router = new Router({ prefix: "/oauth" });

router.all("/token", async ctx => {
    const request = new Request(ctx.request);
    const response = new Response(ctx.response);

    try {
        ctx.state.oauth = {
            token: await oauth.token(request, response)
        };

        ctx.set(response.headers);

        ctx.status = response.status;
        ctx.body = response.body;
    } catch (err) {
        ctx.status = err.code || 500;
        ctx.body = err;
        throw err;
    }
});

router.all("/authorize", async ctx => {
    const request = new Request(ctx.request);
    const response = new Response(ctx.response);

    try {
        ctx.state.oauth = {
            code: await oauth.authorize(request, response)
        };

        ctx.set(response.headers);

        ctx.status = response.status;
        ctx.body = response.body;
    } catch (err) {
        ctx.status = err.code || 500;
        ctx.body = err;
        throw err;
    }
});

module.exports = router;
