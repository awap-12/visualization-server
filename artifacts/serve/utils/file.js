const debug = require("debug")("handle:localstorage");
const fs = require("node:fs/promises");
const path = require("node:path");

/**
 * Check local file system exist
 * @param {string} path
 * @return {Promise<boolean>}
 */
async function exists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

/**
 * Move a file to other place locally
 * @param {string} src
 * @param {string} dest
 * @param {boolean} overwrite
 * @param {string} directoryMode
 * @return {Promise<string>}
 */
async function move(src, dest, { overwrite = true, directoryMode } = {}) {
    if (!src || !dest) throw new TypeError("`src` and `dest` required");
    const target = !path.isAbsolute(dest) ? path.resolve(__dirname, "..", dest) : path;
    if (!overwrite && await exists(target)) throw new Error(`The destination file exists: ${dest}`);

    await fs.mkdir(path.dirname(target), {
        recursive: true,
        mode: directoryMode
    });

    try {
        await fs.rename(src, target);
    } catch (err) {
        if (err.code === "EXDEV") {
            await fs.copyFile(src, target);
            await fs.unlink(src);
        } else throw err;
    }

    debug("move file: %s -> %s", src, target);

    return target;
}

/**
 * Remove a local file.
 * @param {string} dest
 * @return {Promise<void>}
 */
async function remove(dest) {
    if (!await exists(dest)) throw new Error(`The destination file exists: ${dest}`);

    await fs.unlink(dest);

    debug("remove file: %s", dest);
}

module.exports = {
    move,
    remove
}
