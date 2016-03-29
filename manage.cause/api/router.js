var express = require('express');

var app = express.Router();

app.use("/db", require("./db/index"));
app.use("/mysql", require("./mysql/index"));

module.exports = app;
