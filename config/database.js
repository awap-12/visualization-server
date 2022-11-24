const debug = require("debug")("config:database");

const {
    MYSQL_HOST: host = "localhost",
    MYSQL_PORT: port = 3306,
    MYSQL_USER: user = "root",
    MYSQL_PASSWORD: password = "root",
    MYSQL_DATABASE: database ="awap"
} = process.env;

debug(`host: ${host}; port: ${+port}; user: ${user}; password: ${password}; database: ${database}`);

module.exports = {
    host,
    port: +port,
    user,
    password,
    database,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000 // maximum time, in milliseconds, that a connection can be idle before being released
    }
}
