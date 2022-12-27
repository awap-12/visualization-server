const debug = require("debug")("config:database");

const {
    DATABASE_HOST: host = "localhost",
    DATABASE_PORT: port = 3306,
    DATABASE_SOCKET_PATH: socketPath,
    DATABASE_USER: user = "root",
    DATABASE_PASSWORD: password = "root",
    DATABASE_URL: database = "awap",
    DATABASE_DIALECT: dialect = "mysql"
} = process.env;

const target = !!socketPath ? { socketPath } : { host, port: +port };

debug("target: %o; user: %s; password: %s; database: %s; dialect: %s", target, user, password, database, dialect);

module.exports = {
    ...target,
    user,
    password,
    database,
    dialect
};
