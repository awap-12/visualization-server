function isCollection(value) {
    return Array.isArray(value) || (value != null && typeof value === "object");
}

const filter = module.exports = {
    /**
     * Filter everything in a collection (array / object). Alias for {@link filterObject} and {@link filterArray}
     *
     * @example
     * filterCollection({ a: { b: { c: undefined }}}, value => value !== undefined})
     * @param {array|object} value
     * @param {function(value,key,collection:array|object):boolean} fn
     * @return {array|object}
     */
    filterCollection(value, fn) {
        if (Array.isArray(value)) {
            return filter.filterArray(value, fn);
        } else if (value != null && typeof value === "object") {
            return filter.filterObject(value, fn);
        }

        return value;
    },
    /**
     * Filter object
     * @param {object} obj
     * @param {function|Promise} fn
     * @return {object|Promise<object>}
     */
    filterObject(obj, fn) {
        const newObj = {};

        Object.keys(obj).forEach(key => {
            let value = filter.filterCollection(obj[key], fn);

            if (fn.call(obj, value, key, obj)) {
                if (value !== obj[key] && !isCollection(value))
                    value = obj[key];

                newObj[key] = value;
            }
        });

        return newObj;
    },
    /**
     * Filter object
     * @param {array} array
     * @param {function(value,key,array):boolean} fn
     * @return {array}
     */
    filterArray(array, fn) {
        const filtered = [];

        array.forEach((value, index, array) => {
            value = filter.filterCollection(value, fn);

            if (fn.call(array, value, index, array)) {
                if (value !== array[index] && !isCollection(value))
                    value = array[index];

                filtered.push(value);
            }
        });

        return filtered;
    },
    /**
     * Filter all the undefined, designed for params
     * @param {object} obj
     * @return {object}
     */
    undefinedFilter(obj) {
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === "undefined") {
                delete obj[key];
            }
        });

        return obj;
    }
}
