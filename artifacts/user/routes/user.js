const Router = require("koa-router");
const userHandle = require("../handles/user.js");

const router = new Router();

router.post("/login", async ctx => {
    try {
        const { name, password } = ctx.request.body;

        const result = await userHandle.getUser(name, password);
        if (!result) throw new Error("password error");

        ctx.status = 200;
    } catch (err) {
        ctx.status = 500;
    }
});

router.post("/register", async ctx => {
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
