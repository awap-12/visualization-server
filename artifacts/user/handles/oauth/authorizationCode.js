const { OAuthAuthorizationCode, OAuthClient, User } = require("../model.js").models;

/**
 * Get authorization code
 * @param code
 * @return {Promise<any>}
 */
async function getAuthorizationCode(code) {
    return await OAuthAuthorizationCode.findOne({
        where: { code: code },
        attributes: ["expires", "scope"],
        include: [
            { model: User, as: "user" },
            { model: OAuthClient, as: "client"}
        ]
    });
}

/**
 * Save authorization code
 * @param code
 * @param client
 * @param user
 * @return {Promise<*>}
 */
async function saveAuthorizationCode(code, client, user) {
    return await OAuthAuthorizationCode.create({
        code: code.authorizationCode,
        expires: code.expiresAt,
        redirectUri: code.redirectUri,
        clientId: client.id,
        userId: user.id,
        scope: code.scope
    });
}

/**
 * Remove authorization code
 * @param code
 * @return {Promise<*>}
 */
async function deleteAuthorizationCode(code) {
    return await OAuthAuthorizationCode.destroy({
        where: { code: code }
    });
}

module.exports = {
    getAuthorizationCode,
    saveAuthorizationCode,
    deleteAuthorizationCode
};
