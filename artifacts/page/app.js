const express = require("express");
const logger = require("morgan");
const path = require("node:path");

const indexRouter = require("./routes/index");

const app = new express();

// view engine setup
app.set("views", path.join(__dirname, "view"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);

module.exports = app;
