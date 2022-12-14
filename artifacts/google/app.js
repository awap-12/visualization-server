const express = require('express');

const app = new express();

app.get("_ah/warmup", (req, res) => {
    // https://cloud.google.com/appengine/docs/standard/configuring-warmup-requests?authuser=1&tab=node.js
});

module.exports = app;
