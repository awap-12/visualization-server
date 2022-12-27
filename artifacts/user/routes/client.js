const Router = require("koa-router");
const clientHandle = require("../handles/oauth/client.js")

const router = new Router({ prefix: "/client" });

router.post("/", async ctx => {
    try {
        const { id, secret, grants, redirectUris } = ctx.request.body;

        const result = await clientHandle.saveClient(id, secret, redirectUris, grants);
        if (!result) throw new Error("Client exist");

        ctx.status = 200;
    } catch (err) {
        ctx.status = 500;
    }
});

module.exports = router;
