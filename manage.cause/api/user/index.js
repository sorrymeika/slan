var express = require('express');
var userModel = require('../models/user');

var app = express.Router();

app.get('/captcha', function(req, res) {
    var token = req.query.token;

    if (token) {
        userModel.captcha[token] = require("../../../util/captcha")(req, res);

    } else {
        res.send('');
    }
});

app.post('/signup', require("./signup"));

//用户登录权限设置
app.use(function(req, res, next) {
    var token = req.body.token;

    if (req.body.userId && token) {
        userModel.getToken(req.body.userId, token, function(err, result) {
            if (result == token) {
                next();
            } else {
                res.json({
                    success: false,
                    msg: '还未登录',
                    error_code: 'TOKEN_ERROR'
                });
            }
        });

    } else {
        res.json({
            success: false,
            msg: '还未登录',
            error_code: 'TOKEN_ERROR'
        })
    }
});

module.exports = app;
