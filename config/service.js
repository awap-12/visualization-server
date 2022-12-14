/**
 * Set up server config
 * @example
 * [SERVER]: {
 *     prefix: "URL_UNDER_HOST"
 *     maxForks?: "MAX_FORK"
 *     port?: "SERVICE PORT"
 *     url?: "THIRD_PART_URL"
 * }
 * @type {{{prefix:string,maxForks?:number,port?: number,url?:string}}}
 */
const serviceConfig = {
    "page": {
        prefix: "default",
        maxForks: 1
    },
    "user": {
        prefix: "/api/user",
        maxForks: 1
    },
    "serve": {
        prefix: "/api/serve",
        maxForks: 1
    }
};

module.exports = serviceConfig;
