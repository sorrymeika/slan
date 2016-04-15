var util = require('../../../core/util');
var Validator = require('../../../core/validator');
var userModel = require('../models/user');
var causedb = require('../data/causedb');
var redis = require('../data/redis');
var md5 = require('../../../util/md5').md5;

module.exports = function(req, res) {
    var valid = new Validator();
    var email = valid.email(req.body.email, false, "email can not be empty");
    var password = valid.password(req.body.password, 'password can not be empty');

    if (valid.result.success) {

        causedb.connect(function(err, conn) {
            if (err) {
                res.json({ success: false, msg: '连接失败' });
                return;
            }

            conn.query("select id,password from user where email=@p0 limit 0,1", [email], function(err, result) {
                if (err) {
                    res.json({ success: false, msg: '[500错误]query user' });
                    return;
                }

                if (!result.length) {
                    res.json({ success: false, msg: '用户不存在' });
                    return;
                }
                result = result[0];

                var user = userModel.get(result.id) || { id: result.id };

                if (user.tryTimes && user.tryTimes > 5) {
                    if (Date.now() - user.tryTime > 1000 * 60 * 3) {
                        user.tryTimes = 0;
                    } else {
                        res.json({ success: false, msg: '您输入密码错误次数过多，请五分钟后重试！' });
                        return;
                    }
                }

                if (result.password != password) {
                    res.json({ success: false, msg: '密码错误' });
                    user.tryTime = Date.now();
                    user.tryTimes = (user.tryTimes || 0) + 1;
                    userModel.set(result.id, user);
                    return;
                }

                /*
                    var validcode = valid.str(req.body.validcode, 'validcode can not be empty');
                    var token = valid.str(req.body.token, 'token can not be empty');
    
                    if (!token || !validcode || !userModel.captcha[token] || validcode.toLowerCase() != userModel.captcha[token].toLowerCase()) {
                        valid.error('验证码错误');
                    }
    
                    userModel.captcha[token] && (delete userModel.captcha[token]);

                if (valid.result.success) {

                } else {
                    res.json(valid.result);
                }
                    */

                var token = md5(email + password + util.formatDate(Date.now(), "yyyyMM"));
                user = {
                    id: result.id,
                    email: email,
                    token: token
                }

                userModel.set(result.id, user);

                res.json({
                    success: true,
                    user: user
                });

            });

        });



    } else {
        res.json(valid.result);
    }

};
