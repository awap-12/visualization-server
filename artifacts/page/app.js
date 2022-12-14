const express = require("express");
const logger = require("morgan");
const path = require("node:path");

const indexRouter = require("./routes/index");
const previewRouter = require("./routes/preview");

const app = new express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/preview", previewRouter);

module.exports = app;
