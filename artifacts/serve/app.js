const express = require("express");
const compression = require("compression");
const logger = require("morgan");
const path = require("node:path");

const indexRoute = require("./routes/index");
const fileRoute = require("./routes/file");
const chartRoute = require("./routes/chart");

const app = new express();

app.use(logger("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRoute);
app.use("/file", fileRoute);
app.use("/chart", chartRoute);

// static folder mapping.
app.use("/static", express.static(path.resolve(__dirname, "static")));

module.exports = app;
