const path = require("node:path");
const fs = require("node:fs/promises");

async function exists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

module.exports = async (src, dest, { overwrite = true, directoryMode } = {}) => {
    if (!src || !dest) throw new TypeError('`sourcePath` and `destinationPath` required');
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
};
