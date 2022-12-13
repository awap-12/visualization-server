const clusterConfig = require("../../../config/cluster");
const fs = require("node:fs/promises");
const path = require("node:path");

const CLUSTER_ROOT = path.resolve(__dirname, "../cluster");

const whiteLst = ["app.js"];

const script = name =>
`const { server } = require("${name}");
const cluster = require("node:cluster");

module.exports = port => {
    if (cluster.isSpawn) {
        cluster.onEvent("syncDatabaseReady", () => {
            server(port);
        });
    }
};`;

void async function () {
    try {
        const files = await fs.readdir(CLUSTER_ROOT);
        for (const file of files) {
            if (!whiteLst.find(value => value === file)) {
                await fs.unlink(path.join(CLUSTER_ROOT, file));
            }
        }
        for (const key in clusterConfig) {
            await fs.writeFile(path.format({
                dir: CLUSTER_ROOT,
                name: key,
                ext: "js"
            }), script(key));
        }
    } catch (err) {
        console.error(err);
    }
}();
