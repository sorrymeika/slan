var express = require('express');

var app = express.Router();

app.post('/resourceMapping', function(req, res) {
    var version = req.body.v;

    res.json({
        success: true,
        data: {}
    });
});

module.exports = app;
