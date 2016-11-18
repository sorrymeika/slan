var $ = require('$');
var util = require('util');
var Activity = require('activity');
var Loader = require('widget/loader');
var Model = require('core/model2').Model;
var Promise = require('promise');
var Toast = require('widget/toast');
var popup = require('widget/popup');

var chat = require('logical/chat');
var user = require('models/user');

module.exports = Activity.extend({

    onCreate: function () {
        var self = this;

        var personId = this.route.params.id;

        var model = this.model = new Model(this.$el, {
            messages: []
        });

        this.sendResult = this.sendResult.bind(this);
        this.newMessage = this.newMessage.bind(this);

        chat.on('sendresult' + personId, this.sendResult)
            .on('message:' + personId, this.newMessage);

        model.back = function () {
            self.back(self.swipeRightBackAction)
        }

        model.send = function () {
            var content = this.data.content;
            if (!content) return;

            var messages = model._('messages');
            var data = {
                gid: chat.getGid(),
                type: chat.MESSAGETYPE.TEXT,
                content: content,
                to_id: personId,
                from_id: user.get('user_id'),
                is_show_time: false
            };

            messages.add(data);

            console.log("send:", model.get('content'))

            model.set({
                content: ''

            }).next(function () {
                self.scroll && self.scroll.scrollToEnd();
            });
            console.log("aftersend:", model.get('content'))

            chat.send(data);
        }

        var loader = this.loader = new Loader(this.$el);

        loader.showLoading();

        model.refs.send.onsubmit = function () {
            model.send();
        }

        Promise.all([chat.getMessages(personId), this.waitLoad()]).then(function (results) {

            var res = results[0];
            var messages = res.data;

            var scroll = self.scroll = self.bindScrollTo(model.refs.main).eq(0);

            var loadMore = function (e, options) {
                if (scroll.scrollTop() == 0) {

                    var scrollBottom = options.scrollHeight - options.y;

                    model.set({
                        showMore: true,
                        showMoreLoading: true,
                        moreMsg: '正在加载...'
                    });
                    chat.getMessages(personId, model.get('messages')[0].msg_id).then(function (res) {
                        if (!res.data || !res.data.length) {
                            scroll.$el.off('scrollStop', loadMore);
                            model.set({
                                showMoreLoading: false,
                                moreMsg: '没有更多消息了'
                            });

                        } else {
                            model._('messages').insert(0, res.data)
                            model.next(function () {
                                scroll.scrollTop(scroll.scrollHeight() - scrollBottom);
                            });
                        }
                    });
                }
            }

            scroll.$el.on('scrollStop', loadMore);

            model.set({
                user: user,
                friend: res.user,
                messages: messages

            }).next(function () {
                scroll.scrollToEnd();
            });

            model.scrollToEnd = function () {
                self.scroll.scrollToEnd();
            }

        }).catch(function (e) {
            Toast.showToast(e.message);

        }).then(function () {
            loader.hideLoading();
        });
    },

    onShow: function () {
        var self = this;
        chat.readMessage(this.route.params.id);
    },

    onDestory: function () {
        var personId = this.route.params.id;
        chat.off('sendresult:' + personId, this.sendResult)
            .off('message:' + personId, this.newMessage);

        this.model.destroy();
    },

    sendResult: function (e, msg) {
        this.model._('messages').find('gid', msg.gid).set({
            msg_id: msg_id
        });
    },

    newMessage: function (e, msg) {

        console.log('recieve new message')
        var self = this;
        this.model._('messages').add(msg);
        this.model.next(function () {
            self.scroll.scrollToEnd();
        });

        if (this.status != 'Pause') {
            chat.readMessage(this.route.params.id);
        }
    }
});
