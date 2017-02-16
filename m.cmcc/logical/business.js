var util = require('util');
var bridge = require('bridge');
var model2 = require('core/model2');
var Http = require('core/http');
var Promise = require('promise');
var businessModel = require('models/business');
var Loader = require('widget/loader');
var Toast = require('widget/toast');

var appconfig = require('models/appconfig');

var business = {
    getThirdUrl: function () {
        return Http.post('/business/getThirdUrl');
    },

    getBusinessWithSettings: function () {
        return Http.post('/business/getBusinessWithSettings');
    },

    setBussnessSetting: function (business_id, switcher) {
        return Http.post('/business_settings/set', {
            business_id: business_id,
            switcher: switcher
        });
    },

    getAllBusinessAndUnread: function () {
        var last_read_time = util.store('last_read_time');
        if (!last_read_time) {
            last_read_time = util.formatDate(Date.now());
        }

        return Http.post('/business/getAllBusinessAndUnread', {
            lastReadDate: util.formatDate(last_read_time)

        }).then(function (res) {
            util.store('last_read_time', res.serverTime);

            //业务列表
            var list = businessModel._('list');

            list.update(res.data, 'business_id', true);

            if (res.unreadNotifications || res.unreadSysNotifications) {

                var unreadNotifications = [];

                if (res.unreadNotifications && res.unreadNotifications.length) {
                    unreadNotifications = unreadNotifications.concat(res.unreadNotifications);
                }
                if (res.unreadSysNotifications && res.unreadSysNotifications.length) {
                    unreadNotifications = unreadNotifications.concat(res.unreadSysNotifications);
                }

                var notifications = businessModel._('notifications');
                notifications.update(unreadNotifications, 'notify_id');

                //将未读消息分配到所在业务
                var ids = [];

                //无消息的业务
                var idsOfBusinessWithNoNotification = [];

                list.data.forEach(function (item) {
                    var first = util.first(unreadNotifications, 'business_id', item.business_id);

                    if (first) {
                        ids.push(first.notify_id);

                    } else if (!item.title) {
                        idsOfBusinessWithNoNotification.push(item.business_id);
                    }
                });

                if (ids.length) {
                    Http.post('/business/getNotificationByIds', {
                        ids: ids.join(',')

                    }).then(function (res) {

                        list.update(util.map(res.data, ['business_id', 'title', 'content', 'send_date']), 'business_id');
                    })
                }


                if (idsOfBusinessWithNoNotification) {
                    Http.post('/business/getNotificatonsByBusinessIds', {
                        ids: idsOfBusinessWithNoNotification.join(',')

                    }).then(function (res) {

                        list.update(util.map(res.data, ['business_id', 'title', 'content', 'send_date']), 'business_id');
                    })
                }
            }

            return res;
        });
    },

    getMail139: function () {
        return Http.post('/business/getMail139');
    },

    getHjbUrl: function () {
        return Http.post('/business/getHjbUrl');
    },

    getHLYUrl: function () {
        return Http.post('/business/getHLY');
    },

    notificationsLoader: function (model, beforeRender) {
        return Loader.pageLoader({
            url: "/business/getNotifications",
            model: model,
            beforeRender: beforeRender
        });
    },

    addBill: function (business_id, unitno, user_code, memo) {
        return Http.post("/user_business/add", {
            unitno: unitno,
            business_id: business_id,
            type: business_id == 100004 ? 'WAT01' : business_id == 100005 ? 'EFE01' : 'GAS01',
            user_code: user_code,
            funcode: 'PUB_CX',
            memo: memo
        });
    },

    updateBill: function (id, business_id, unitno, user_code, memo) {
        return Http.post("/user_business/update", {
            ubid: id,
            unitno: unitno,
            business_id: business_id,
            user_code: user_code,
            memo: memo
        });
    },

    deleteUserBusiness: function (ubid) {
        return Http.post("/user_business/deleteById", {
            ubid: ubid
        });
    },

    getUserBusiness: function (business_id) {
        return Http.post("/user_business/getUserBusiness", {
            business_id: business_id
        });
    },

    queryBusiness: function (ubid) {
        return Http.post("/user_business/queryBusiness", {
            id: ubid
        });
    }
}

var redirect = {};

redirect.jump = function (linkurl) {
    var match;

    if (linkurl) {
        if (linkurl.indexOf('cmccfjapp://open.10086.cn') != -1) {
            linkurl = linkurl.substr(linkurl.indexOf('?'));
            match = linkurl.match(/(?:\&|\?)url\=(.+?)(=\&|$)/);

            if (!match) return;

            linkurl = decodeURIComponent(match[1]);
        }

        if (/^(http\:|https\:)/.test(linkurl)) {
            bridge.openInApp(linkurl);

        } else if (linkurl.charAt(0) == '#' || linkurl.charAt(0) == '/') {
            Application.forward(linkurl);

        } else if (linkurl == 'hjb') {
            this.enterHjb();

        } else if (linkurl == 'qz') {
            this.enterQz();

        } else if (linkurl == '139' || linkurl.indexOf('139?') == 0) {
            var m = linkurl.match(/mailId\=([^&]+)/);

            this.enterMail139(m && m[1] ? decodeURIComponent(m[1]) : null);

        } else if (linkurl == 'sc') {
            this.enterSc();

        } else if (linkurl == 'hly') {
            this.enterHLY();

        } else if ((match = linkurl.match(/^b(\d+)$/))) {
            Application.forward('/business/' + match[1]);
        }
    }
}

redirect.enterShop = function () {
    bridge.openInApp("福建移动营业厅", 'http://wap.fj.10086.cn/servicecb/touch/index.jsp');
}

redirect.enterHjb = function () {
    business.getHjbUrl().then(function (res) {

        bridge.openInApp("和聚宝", res.data);

    }).catch(function (e) {
        Toast.showToast(e.message);
    });
}

redirect.enterHLY = function () {
    business.getHLYUrl().then(function (res) {

        bridge.openInApp("和留言", res.data);

    }).catch(function (e) {
        Toast.showToast(e.message);
    });
}

redirect.enterQz = function () {
    bridge.openInApp("12580海西求职平台", appconfig.get('qzUrl'));
}

function stringToHex(str) {
    var val = "";
    for (var i = 0; i < str.length; i++) {
        val += str.charCodeAt(i).toString(16);
    }
    return val;
}

var mail139Url;
redirect.enterMail139 = function (mailId) {

    business.getMail139().then(function (res) {
        mail139Url = res.data;

        if (mailId) {
            mail139Url = mail139Url.replace('Flag=32', 'Flag=35') + "&Message=" + encodeURIComponent('mid=' + stringToHex(mailId));
        }

        setTimeout(function (params) {
            bridge.openInApp('139邮箱', mail139Url);
        }, 300)

    }).catch(function (e) {
        Toast.showToast(e.message);
    });
}

redirect.enterSc = function () {
    Application.back('/');

    setTimeout(function () {
        $(window).trigger('tabchange_to_3');

    }, 400);
}

redirect.enterEnt = function () {
    Application.back('/');

    setTimeout(function () {
        $(window).trigger('tabchange_to_2');

    }, 400);
}

business.redirect = redirect;

module.exports = business;