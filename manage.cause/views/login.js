define(function (require, exports, module) {

    var $ = require('$');
    var util = require('util'),
        Page = require('core/page'),
        model = require('core/model'),
        API = require('models/api').API,
        Form = require('components/form');

    return Page.extend({
        events: {},

        onCreate: function () {
            var self = this;

            self.$el.siblings().hide();

            this.model = new model.ViewModel(this.$el, {
                title: '登录',
                buttons: [{
                    value: '确认',
                    click: function () {
                        form.submit(function (res) {
                            if (res.success) {
                                sl.tip('登录成功');
                                self.back('/');

                            } else {
                                sl.tip(res.msg);
                            }
                        });
                    }
                }]
            });

            var form = new Form({
                model: this.model,
                title: 'test',
                fields: [{
                    label: '账号',
                    field: 'username',
                    emptyAble: false,
                    emptyText: '不可为空'
                }]
            });

        },

        onShow: function () {
        },

        onDestroy: function () {
        }
    });
});

