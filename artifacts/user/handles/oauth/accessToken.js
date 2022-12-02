const { OAuthAccessToken, OAuthClient, User } = require("../model").models;

/**
 * Get an access token
 * [rules](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getaccesstoken-accesstoken-callback)
 * @param {string} bearerToken
 * @return {Promise<Model>}
 */
async function getAccessToken(bearerToken) {
    return await OAuthAccessToken.findOne({
        where: { accessToken: bearerToken },
        attributes: ["accessToken", "accessTokenExpiresAt", "scope"],
        include: [
            { model: User, as: "user" },
            { model: OAuthClient, as: "client" }
        ]
    });
}

/**
 * Save an access token
 * [rules](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#savetoken-token-client-user-callback)
 * @param {object} token
 * @param {object} client
 * @param {object} user
 * @return {Promise<Model>}
 */
async function saveAccessToken(token, client, user) {
    return await OAuthAccessToken.create({
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        clientId: client.id,
        userId: user.id,
        scope: token.scope
    });
}

module.exports = {
    getAccessToken,
    saveAccessToken
};
