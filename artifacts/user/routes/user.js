const Router = require("koa-router");
const userHandle = require("../handles/user");

const router = new Router();

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

router.post("/", async ctx => {
    try {
        const { name, password } = ctx.request.body;

        const result = await userHandle.trySaveUser(name, password);
        if (!result) throw new Error("password error");

        ctx.status = 200;
    } catch (err) {
        ctx.status = 500;
    }
});

router.put("/", /** auth middleware */ async ctx => {
    try {
        const { name, password } = ctx.request.body;

        const result = await userHandle.updateUser(name, { password });
        if (!result) throw new Error("unknown user");

        ctx.status = 200;
    } catch (err) {
        ctx.status = 500;
    }
});

router.delete("/:id", async ctx => {
    try {
        const { id } = ctx.request.params;

        const result = await userHandle.deleteUser(id);
        if (!result) throw new Error("unknown id")

        ctx.status = 200;
    } catch (err) {
        ctx.status = 500;
    }
});

module.exports = router;
