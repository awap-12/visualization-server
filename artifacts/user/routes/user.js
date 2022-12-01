const Router = require("koa-router");
const user = require("../handles/user");

const router = new Router();

const { NODE_ENV } = process.env;

const isDev = NODE_ENV === "development";
const basePath = isDev ? '' : "/api/user";

router.get("/", async ctx => {
    const query = ctx.querystring;

    await ctx.render("index", {
        basePath: basePath,
        query: query,
        image: {
            /** a high pixel version image */
            large: `${basePath}/img/background.jpg`,
            /** a low pixel version image */
            small: `${basePath}/img/background-small.jpg`
        }
    });
});

router.post("/register", async (ctx, next) => {
    try {
        const { name, password } = ctx.request.body;

        const result = await user.trySaveUser(name, password);
        if (!result) throw new Error("password error");

        ctx.status = 200;
    } catch (err) {
        ctx.status = 500;
    }
});

module.exports = router;
