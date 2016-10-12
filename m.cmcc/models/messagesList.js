var util = require('util');
var model2 = require('core/model2');


var messagesList = model2.createModel({
    defaultData: sl.isDebug ? {
        list: [{
            user_id: 1,
            user_name: '小黑',
            date: 1476211314511,
            msg: '[图片]',
            unread: 3,
            last_msg_id: 0

        }, {
                user_id: 2,
                user_name: '小白',
                date: 1476211314511,
                msg: '[图片]',
                unread: 0,
                last_msg_id: 0
            }]

    } : util.store('messagesList')
});


module.exports = messagesList;