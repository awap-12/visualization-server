const debug = require("debug")("handle:oauth");
const oauthServer = require("oauth2-server");

const OAuthAccessToken = require("./accessToken");
const OAuthRefreshToken = require("./refreshToken");
const OAuthAuthorizationCode = require("./authorizationCode");
const OAuthClient = require("./client");
const User = require("../user");

async function getAccessToken(bearerToken) {
    try {
        const result = await OAuthAccessToken.getAccessToken(bearerToken);

        return {
            accessToken: result.accessToken,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
            scope: result.scope,
            client: result.client,
            user: result.user
        };
    } catch (err) { debug("getAccessToken: ", err); }
}

async function getRefreshToken(refreshToken) {
    try {
        const result = await OAuthRefreshToken.getRefreshToken(refreshToken);

        return {
            refreshToken: refreshToken,
            refreshTokenExpiresAt: result ? new Date(result.refreshTokenExpiresAt) : null,
            scope: result.scope,
            client: result ? result.client : {},
            user: result ? result.user : {}
        };
    } catch (err) { debug("getRefreshToken: ", err); }
}

async function saveToken(token, client, user) {
    try {
        await Promise.all([
            OAuthAccessToken.saveAccessToken(token, client, user),
            token.refreshToken ? OAuthRefreshToken.saveRefreshToken(token, client, user) : []
        ]);

        return { client, user, ...token };
    } catch (err) { debug("saveToken: ", err); }
}

async function revokeToken(token) {
    try {
        await OAuthRefreshToken.deleteRefreshToken(token);

        return { ...token, refreshTokenExpiresAt: new Date(null) }
    } catch (err) { debug("revokeToken: ", err); }
}

async function getAuthorizationCode(code) {
    try {
        const result = await OAuthAuthorizationCode.getAuthorizationCode(code);

        return {
            code: code,
            expiresAt: result.expires,
            redirectUri: result.client.redirectUris,
            scope: result.scope,
            client: result.client,
            user: result.user
        };
    } catch (err) { debug("getAuthorizationCode: ", err); }
}

async function saveAuthorizationCode(code, client, user) {
    try {
        await OAuthAuthorizationCode.saveAuthorizationCode(code, client, user);

        return { ...code, client, user };
    } catch (err) { debug("saveAuthorizationCode: ", err); }
}

async function getClient(clientId, clientSecret) {
    try {
         const result = await OAuthClient.getClient(clientId, clientSecret);

        return {
            id: result.id,
            redirectUris: result.redirectUris,
            grants: result.grants
        };
    } catch (err) { debug("getClient: ", err); }
}

async function getUserFromClient(client) {
    try {
        let result = await OAuthClient.getUserFromClient(client);

        return !!result && "user" in result ? result.user.get() : false;
    } catch (err) { debug("getUserFromClient: ", err); }
}

async function getUser(username, password) {
    try {
        let result = await User.getUser(username, password);

        return result.get();
    } catch (err) { debug("getUser: ", err); }
}

async function validateScope(token, client, scope) {
    // return (token.scope === scope && client.scope === scope && scope !== null) ? scope : false
    return "*";
}

async function verifyScope(token, scope) {
    // return token.scope === scope
    return true;
}

/**
 * have to match the oauth server
 * https://oauth2-server.readthedocs.io/en/latest/model/spec.html#model-specification
 */
module.exports = new oauthServer({
    model: {
        // generateAccessToken(client, user, scope) optional
        // generateAuthorizationCode(), optional
        // generateRefreshToken(client, user, scope) - optional
        getAccessToken,
        getRefreshToken,
        getAuthorizationCode,
        getClient,
        getUser,
        getUserFromClient,
        //revokeAuthorizationCode,
        revokeToken,
        saveToken,
        saveAuthorizationCode,
        validateScope,
        verifyScope
    },
    allowBearerTokensInQueryString: true,
    accessTokenLifetime: 4 * 60 * 60
});
