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


// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;
