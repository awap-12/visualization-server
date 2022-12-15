const express = require("express");
const compression = require("compression");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const previewRouter = require("./routes/preview");

const app = new express();

app.use(logger("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/preview", previewRouter);

module.exports = app;
