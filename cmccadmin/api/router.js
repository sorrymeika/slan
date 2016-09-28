var express = require('express');

var app = express.Router();

app.all("*", function(req, res, next) {
    res.set('Access-Control-Allow-Credentials', true);
    res.set('Access-Control-Allow-Origin', req.headers.origin);

    next();
})

app.use("/db", require("./db/index"));
app.use("/mysql", require("./mysql/index"));
app.use("/oracle", require("./oracle/index"));
app.use("/settings", require("./settings/index"));
app.use("/user", require("./user/index"));

module.exports = app;
