const { Storage } = require("@google-cloud/storage");
const fs = require("node:fs/promises");
const path = require("node:path");

const {
    PROJECT_ID: projectId = "visualization-awap-12", // TODO: team name!
    GCP_STORAGE_BUCKET: bucketName = `${projectId}.appspot.com`
} = process.env;

const storage = new Storage();

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
 * Move a local file to cloud storage
 * @param {string} src
 * @param {string} dest
 * @param {boolean} overwrite
 * @param {string} directoryMode
 * @return {Promise<void>}
 */
async function move(src, dest, { overwrite = true, directoryMode } = {}) {
    if (!src || !dest) throw new TypeError("`src` and `dest` required");
    if (!overwrite && await exists(dest)) throw new Error(`The destination file exists: ${dest}`);

    await storage.bucket(bucketName).upload(src, { destination: dest });

    await fs.unlink(src);
}

/**
 * Remove a cloud file
 * @param dest
 * @return {Promise<void>}
 */
async function remove(dest) {
    if (!await exists(dest)) throw new Error(`The destination file exists: ${dest}`);

    await storage.bucket(bucketName).file(dest).delete();
}

module.exports = {
    move,
    remove
}
