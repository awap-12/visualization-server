const debug = require("debug")("config:database");

const {
    DATABASE_URL: database = "awap",
    DATABASE_HOST: host = "localhost",
    DATABASE_PORT: port = 3306,
    DATABASE_USER: user = "root",
    DATABASE_PASSWORD: password = "root",
    DATABASE_DIALECT: dialect = "mysql"
} = process.env;

debug(`host: ${host}; port: ${+port}; user: ${user}; password: ${password}; database: ${database}; dialect: ${dialect}`);

module.exports = {
    host,
    port: +port,
    user,
    password,
    database,
    dialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000 // maximum time, in milliseconds, that a connection can be idle before being released
    }
}
