const Router = require("koa-router");

const router = new Router({ prefix: "/auth" });

const { NODE_ENV } = process.env;

const isDev = NODE_ENV === "development";
const basePath = isDev ? '' : "/api/user";

router.get("/", async ctx => {
    const query = ctx.querystring;

    await ctx.render("index", {
        basePath: basePath,
        query: query ?? '',
        image: {
            /** a high pixel version image */
            large: `${basePath}/img/background.jpg`,
            /** a low pixel version image */
            small: `${basePath}/img/background-small.jpg`
        }
    });
});

module.exports = router;
