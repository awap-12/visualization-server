const express = require("express");
const compression = require("compression");
const logger = require("morgan");

const indexRouter = require("./routes/index.js");
const viewRouter = require("./routes/view.js");
const previewRouter = require("./routes/preview.js");

const app = new express();

app.use(logger("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/view", viewRouter);
app.use("/preview", previewRouter);

module.exports = app;
