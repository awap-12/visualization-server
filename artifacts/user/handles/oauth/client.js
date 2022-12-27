const { OAuthClient, User } = require("../model.js").models;

/**
 * Get client
 * [rule](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getclient-clientid-clientsecret-callback)
 * @param {string} clientId
 * @param {string} [clientSecret]
 * @return {Promise<Model>}
 */
async function getClient(clientId, clientSecret) {
    let options = {
        where: { id: clientId },
        attributes: ["id", "redirectUris", "grants", "scope"],
    }
    if (clientSecret) options.where.secret = clientSecret;

    return await OAuthClient.findOne(options);
}

/**
 * Get user from client
 * @param {String} clientId
 * @param {String} clientSecret
 * @return {Promise<Model>}
 */
async function getUserFromClient(clientId, clientSecret) {
    const options = {
        where: { id: clientId },
        attributes: ["id", "redirectUris"],
        include: [{ model: User, as: "user" }]
    };
    if (clientSecret) options.where.clientSecret = clientSecret;

    return await OAuthClient.findOne(options);
}

/**
 * Add a client
 * @param {string} clientId
 * @param {string} clientSecret
 * @param {string[]|string} redirectUris
 * @param {string[]|string} grants
 * @return {Promise<Model>}
 */
async function saveClient(clientId, clientSecret, redirectUris, grants) {
    return await OAuthClient.create({
        id: clientId,
        secret: clientSecret,
        redirectUris: redirectUris,
        grants: grants,
    });
}

module.exports = {
    getClient,
    getUserFromClient,
    saveClient
}
