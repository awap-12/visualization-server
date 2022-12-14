const { Storage } = require("@google-cloud/storage");
const fs = require("node:fs/promises");

const {
    PROJECT_ID: projectId = "visualization-awap-12", // TODO: team name!
    GCP_STORAGE_BUCKET: bucketName = `${projectId}.appspot.com`
} = process.env;

const storage = new Storage();

/**
 * Move a local file to cloud storage
 * @param {string} src
 * @param {string} dest
 * @return {Promise<void>}
 */
async function move(src, dest) {
    if (!src || !dest) throw new TypeError("`src` and `dest` required");

    await storage.bucket(bucketName).upload(src, { destination: dest });

    await fs.unlink(src);
}

/**
 * Remove a cloud file
 * @param dest
 * @return {Promise<void>}
 */
async function remove(dest) {
    await storage.bucket(bucketName).file(dest).delete();
}

module.exports = {
    move,
    remove
}
