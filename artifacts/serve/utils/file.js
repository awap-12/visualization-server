const fs = require("node:fs/promises");
const path = require("node:path");

async function exists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    async move(src, dest, { overwrite = true, directoryMode } = {}) {
        if (!src || !dest) throw new TypeError('`src` and `dest` required');
        if (!overwrite && await exists(dest)) throw new Error(`The destination file exists: ${dest}`);

        await fs.mkdir(path.dirname(dest), {
            recursive: true,
            mode: directoryMode
        });

        try {
            await fs.rename(src, dest);
        } catch (err) {
            if (err.code === "EXDEV") {
                await fs.copyFile(src, dest);
                await fs.unlink(src);
            } else throw err;
        }
    },
    async remove(dest) {
        if (!await exists(dest)) throw new Error(`The destination file exists: ${dest}`);

        await fs.unlink(dest);
    }
}
