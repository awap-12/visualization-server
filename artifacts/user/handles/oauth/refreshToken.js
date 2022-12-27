const { OAuthRefreshToken, OAuthClient, User } = require("../model.js").models;

/**
 * Get an access token
 * [rules](https://oauth2-server.readthedocs.io/en/latest/model/spec.html#getaccesstoken-accesstoken-callback)
 * @param {string} refreshToken
 * @return {Promise<Model>}
 */
async function getRefreshToken(refreshToken) {
    return await OAuthRefreshToken.findOne({
        where: { refreshToken: refreshToken },
        attributes: ["refreshTokenExpiresAt", "scope"],
        include: [
            { model: User, as: "user" },
            { model: OAuthClient, as: "client" }
        ]
    });
}

async function saveRefreshToken(token, client, user) {
    return await OAuthRefreshToken.create({
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        clientId: client.id,
        userId: user.id,
        scope: token.scope
    });
}

async function deleteRefreshToken(token) {
    return await OAuthRefreshToken.destroy({
        where: { refreshToken: token.refreshToken }
    });
}

module.exports = {
    getRefreshToken,
    saveRefreshToken,
    deleteRefreshToken
};
