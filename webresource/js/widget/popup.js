var $ = require('$');
var Promise = require('promise');

var $mask = $('<div class="cp_popup__mask"></div>').appendTo('body');

$mask.on($.fx.transitionEnd, function () {

    if (!$(this).hasClass('show')) {
        this.style.display = 'none';
    }
});

function showMask() {
    $mask.show()[0].clientHeight;
    $mask.addClass('show');
}

var popupPromise = Promise.resolve();
var popups = [];

module.exports = {

    //@params={title: '结束咨询',content: '您是否确认结束本次咨询?',btn: '确定',action: function(){} }
    alert: function (params) {

        params = Object.assign({
            title: "温馨提醒",
            btn: '确定',
            action: function () { }
        }, params)

        var content = '<div class="cp_popup__title">' + params.title + '</div>\
        <div class="cp_popup__desc">'+ params.content + '</div>\
        <div class="cp_popup__action"><button class="btn" click="action">'+ params.btn + '</button></div>';

        this.popup({
            content: content,
            action: function () {
                this.hide();
                params.action.call(this);
            }
        })
    },

    //@params={title: '结束咨询',content: '您是否确认结束本次咨询?', cancelAction: function(){}, cancelText: '继续咨询', confirmAction: function(){}, confirmText: '结束咨询' }
    confirm: function (params) {

        params = Object.assign({
            title: "温馨提醒",
            confirmText: '确定',
            cancelText: '取消',
            cancelAction: function () { }
        }, params)

        var content = '<div class="cp_popup__title">' + params.title + '</div>\
        <div class="cp_popup__desc">'+ params.content + '</div>\
        <div class="cp_popup__action"><button class="btn btn_cancel" click="cancelAction">'+ params.cancelText + '</button><button class="btn" click="confirmAction">' + params.confirmText + '</button></div>';

        this.popup({
            content: content,
            confirmAction: params.confirmAction,
            cancelAction: function () {
                this.hide();
                params.cancelAction.call(this);
            }
        })
    },

    //@params={ title: '给医生的回答打下分吧', placeholder: '我想要说几句', maxLength: 100, cancelText: '取消', confirmAction: function(){}, confirmText: '确认' }
    prompt: function (params) {

        var content = '<div class="cp_popup__title">' + params.title + '</div>\
        <div class="cp_popup__desc"><input class="cp_popup__input" placeholder="'+ params.placeholder + '"></div>\
        <div class="cp_popup__action"><button class="btn btn_cancel" click="cancelAction">'+ params.cancelText + '</button><button class="btn" click="confirmAction">' + params.confirmText + '</button></div>';

        this.popup({
            content: content,
            confirmAction: function () {
                var value = this.find('.cp_popup__input').val();

                params.confirmAction.call(this, value);
            },
            cancelAction: function () {
                this.hide();
                params.cancelAction.call(this);
            }
        })

    },

    //@params={content:'内容<button click="confirm"></button>',initialize:function(){},confirm:function(){}}
    popup: function (params) {
        var ret = {

            find: function (selector) {
                return ret.$container.find(selector)
            },

            hide: function () {

                this.promise.then(function () {

                    (popups.length <= 1) && $mask.removeClass('show');
                    ret.$container.removeClass('show');

                    for (var i = popups.length; i >= 0; i--) {
                        if (popups[i] == ret) {
                            popups.splice(i, 1);
                            break;
                        }
                    }
                    ret.resolve();
                })
            },
            promise: popupPromise
        };

        popupPromise = popupPromise.then(function () {

            return new Promise(function (resolve, reject) {
                ret.resolve = resolve;

                var $container = $('<div class="cp_popup__container"></div>')
                    .on($.fx.transitionEnd, function () {
                        if (!$(this).hasClass('show')) {

                            this.parentNode && this.parentNode.removeChild(this);
                        }
                    })
                    .on('click', '[click]', function (e) {

                        var actionName = $(e.currentTarget).attr('click');

                        params[actionName].call(ret, e);

                        if ((params.type == 'alert' && actionName == 'action') || actionName == 'cancelAction') {
                            ret.hide();
                        }
                    });

                ret.$container = $container;

                $container.append(params.content);

                $container.appendTo('body');

                showMask();
                $container.addClass('show');

                popups.push(ret);
            });
        });

        return ret;
    },

    hidePopup: function () {
        if (popups.length) popups.pop().hide();
    },

    hideAllPopups: function () {

        if (popups.length) {
            $mask.removeClass('show');
            $('.cp_popup__container').removeClass('show');
            popups.length = 0;
            popupPromise = Promise.resolve();
        }
    }

};
