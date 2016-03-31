var express = require('express');
var redis = require('../data/redis');
var md5 = require('../../../util/md5');

var app = express.Router();

app.post('/resourceMapping', function(req, res) {
    var version = req.query.v;
    var token = req.query.token;

    res.json({
        success: true,
        data: {},
        token: token == '1' ? '' : md5.md5(Date.now() + '|' + Math.random())
    });
});

module.exports = app;
