#!/usr/bin/env node
const debug = require("debug")("entrance");
const http = require("node:http");
const app = require("./cluster/app.js");
const config = require("./handles/worker.js");

const port = normalizePort(process.env.PORT || "3000");

// Create HTTP server.
const proxy = require("http-proxy").createProxyServer();
const server = http.createServer((req, res) => {
    let path = req.url, rules = config.rules, target = rules["default"];
    for (const pathPrefix in rules) {
        const pathEndSlash = pathPrefix.slice(-1)  === "/";
        const testPrefixMatch = new RegExp(pathEndSlash ? pathPrefix : `(${pathPrefix})(?:\\W|$)`).exec(path);
        if (testPrefixMatch && testPrefixMatch.index === 0) {
            req.url = path.replace(testPrefixMatch[pathEndSlash ? 0 : 1], '');
            target = rules[pathPrefix];
            for (let i = 0; i < testPrefixMatch.length; i++)
                target = target.replace("$" + i, testPrefixMatch[i + (pathEndSlash ? 0 : 1)]);
            break;
        }
    }
    proxy.web(req, res, { target });
});

// Listen on provided port, on all network interfaces.
server.listen(port);
server.on("error", onError(port));
server.on("listening", onListening(server));

/**
 * Normalize a port into a number, string, or false.
 * @param {string|number} val
 * @return {number}
 */
function normalizePort(val) {
    let port = parseInt(val, 10);
    return isNaN(port) ? val : port >= 0 ? port : false;
}

/**
 * Event listener for HTTP server "error" event.
 * @param {number} port
 * @return {function}
 */
function onError(port) {
    let bind = typeof port == "string" ? "Pipe " + port : "Port " + port;
    return error => {
        if (error.syscall !== "listen") throw error;
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                debug("%s requires elevated privileges", bind);
                process.exit(1);
                break;
            case "EADDRINUSE":
                debug("%s is already in use", bind);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}

/**
 * Event listener for HTTP server "listening" event.
 * @param server
 */
function onListening(server) {
    let addr = server.address(),
        bind = typeof addr == "string" ? "pipe " + addr : "port " + addr.port;
    return () => { debug("listening on %s", bind); }
}
