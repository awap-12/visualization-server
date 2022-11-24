const Koa = require("koa");
const serve = require("koa-static");
const compress = require("koa-compress");
const mount = require("koa-mount");
const path = require("node:path");
const cluster = require("node:cluster");

module.exports = port => {
    if (cluster.isSpawn) {
        const app = new Koa();

        app.use(serve(path.resolve(__dirname, "..", "view/build")));
        app.use(mount("/dataset", serve(path.resolve(__dirname, "static"))));

        app.use(compress());

        app.listen(port);
    }
}
