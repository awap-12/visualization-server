const express = require("express");
const compression = require("compression");
const logger = require("morgan");
const path = require("node:path");

const chartRoute = require("./routes/chart");

const app = new express();

app.use(logger("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", function (req, res){
    res.sendFile(path.resolve(__dirname, "view/index.html"));
});

app.use("/chart", chartRoute);

// static folder mapping.
app.use("/static", express.static(path.resolve(__dirname, "static")));

module.exports = app;
