module.exports = {
    secret: process.env.TOKEN_KEY || "VISUALIZATION_JSONWEBTOKEN_KEY",
    algorithm: "HS256",
    requestProperty: "auth",
    resolveToken: req => {
        const authorizationHeader = req.headers && "Authorization" in req.headers ? "Authorization" : "authorization";
        if (req.headers && req.headers[authorizationHeader]) {
            const parts = (req.headers[authorizationHeader]).split(" ");
            return parts.length >= 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;
        }
        return null;
    }
}
