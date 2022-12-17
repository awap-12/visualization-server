const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
const charsLength = chars.length;

/**
 * Generate a base62 string
 * @param {number} length
 * @return {string}
 */
module.exports = length => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(
            Math.floor(
                Math.random() * charsLength
            )
        );
    }
    return result;
}
