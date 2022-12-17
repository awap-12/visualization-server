module.exports = {
    /**
     * Filter out all type value from object or array.
     * @param {object|array} value
     * @param {string} type
     * @return {object|array}
     */
    typeFilter(value, type = "undefined") {
        if (Array.isArray(value)) {
            return value.filter(data => typeof data !== type);
        } else {
            return Object.entries(value).reduce((pre, [key, value]) => {
                return typeof value !== type ? { ...pre, [key]: value } : pre;
            }, {});
        }
    }
}
