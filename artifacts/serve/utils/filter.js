const { types } = require("node:util");

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
        const isAsync = types.isAsyncFunction(fn);

        if (Array.isArray(value)) {
            return isAsync ? filter.filterArrayAsync(value, fn) :  filter.filterArray(value, fn);
        } else if (value != null && typeof value === "object") {
            return isAsync ? filter.filterObjectAsync(value, fn) : filter.filterObject(value, fn);
        }

        return isAsync ? Promise.resolve(value) : value;
    },
    /**
     * Filter object
     * @param {object} obj
     * @param {function|Promise} fn
     * @return {object|Promise<object>}
     */
    filterObject(obj, fn) {
        const newObj = {};

        for (const key in obj) {
            let value = filter.filterCollection(obj[key], fn);
            if (fn.call(obj, value, key, obj)) {
                if (value !== obj[key] && !isCollection(value))
                    value = obj[key];

                newObj[key] = value;
            }
        }

        return newObj;
    },
    async filterObjectAsync(obj, fn) {
        const newObj = {};

        for (const key in obj) {
            let value = await filter.filterCollection(obj[key], fn);
            if (await fn.call(obj, value, key, obj)) {
                if (value !== obj[key] && !isCollection(value))
                    value = obj[key];

                newObj[key] = value;
            }
        }

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

        for (let i = 0; i < array.length; i++) {
            let value = filter.filterCollection(array[i], fn);

            if (fn.call(array, value, i, array)) {
                if (value !== array[i] && !isCollection(value))
                    value = array[i];

                filtered.push(value);
            }
        }

        return filtered;
    },
    async filterArrayAsync(array, fn) {
        const filtered = [];

        for (let i = 0; i < array.length; i++) {
            let value = await filter.filterCollection(array[i], fn);

            if (await fn.call(array, value, i, array)) {
                if (value !== array[i] && !isCollection(value))
                    value = array[i];

                filtered.push(value);
            }
        }

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
