define(function(require, exports, module) {

    var $ = require('$');
    var util = require('util');
    var model = require('core/model');
    var Page = require('core/page');
    var Form = require('components/form');
    var Grid = require('components/grid');

    return Page.extend({
        events: {},

        onCreate: function() {
            var self = this;

            this.model = new model.ViewModel(this.$el, {
                title: '连接数据库'
            });

            this.model.select = function(e, item) {
                form.set(item);
            }

            this.model.connect = function(e, item) {
                form.submit(function(res) {
                    if (res.success) {
                        self.forward('/databases');

                    } else {
                        sl.tip(res.msg);
                    }
                });
            }

            $.get('/api/oracle/config', function(res) {
                if (res.success && res.data) {
                    self.model.set({
                        current: res.data.currentConnection,
                        connections: res.data.connections
                    });

                    form.set(res.data.currentConnection);
                }
            }, 'json');

            var form = this.form = new Form({
                url: '/api/oracle/connect',
                fields: [{
                    label: "host",
                    field: "host",
                    emptyAble: false,
                    emptyText: '不可为空'
                }, {
                        label: "user",
                        field: "user",
                        emptyAble: false,
                        emptyText: '不可为空'
                    }, {
                        label: "password",
                        field: "password",
                        type: 'password',
                        emptyAble: false,
                        emptyText: '不可为空'
                    }]
            });

            form.$el.insertBefore(this.model.refs.action);
        },

        onShow: function() {
        }
    });
});
