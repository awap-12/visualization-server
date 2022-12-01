const debug = require("debug")("util:inject");
const { View } = require("../handles/model").models;
const fs = require("node:fs/promises");
const path = require("node:path");

const STATIC_ROOT = path.resolve(__dirname, "..", "static");
const STATIC_ROOT_POSIX = STATIC_ROOT.split(path.sep).join("/")

let description = {

};

async function collect(ref, root) {
    let stats = await fs.stat(root);
    if (!stats.isDirectory()) {
        ref.push(path.posix.relative(STATIC_ROOT_POSIX, root.split(path.sep).join("/")));
        return;
    }
    let fileNames = await fs.readdir(root);
    for (const fileName of fileNames) {
        await collect(ref, path.join(root, fileName));
    }
}

module.exports = async () => {
    const views = [];
    for (let i = 1; i <= 10; i++) {
        const folderName = `base${`0${i}`.slice(-2)}`, files = [];
        await collect(files, path.join(STATIC_ROOT, folderName));
        const view = {
            id: folderName,
            name: `v${i}`,
            description: description[`v${i}`],
            files: files.map(value => path.posix.join("/static", value))
        }
        debug("inject %o", view);
        views.push(view);
    }
    await View.bulkCreate(views);
};
