var $ = require('$');

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

module.exports = {

    //@params={title: '结束咨询',content: '您是否确认结束本次咨询?',btn: '确定',action: function(){} }
    alert: function (params) {

        var content = '<div class="cp_popup__title">' + params.title + '</div>\
        <div class="cp_popup__desc">'+ params.content + '</div>\
        <div class="cp_popup__action"><button class="btn" click="action">'+ params.btn + '</button></div>';

        this.popup({
            content: content,
            action: params.action
        })
    },

    //@params={title: '结束咨询',content: '您是否确认结束本次咨询?', cancelAction: function(){}, cancelText: '继续咨询', confirmAction: function(){}, confirmText: '结束咨询' }
    confirm: function (params) {

        var content = '<div class="cp_popup__title">' + params.title + '</div>\
        <div class="cp_popup__desc">'+ params.content + '</div>\
        <div class="cp_popup__action"><button class="btn btn_cancel" click="cancelAction">'+ params.cancelText + '</button><button class="btn" click="confirmAction">' + params.confirmText + '</button></div>';

        this.popup({
            content: content,
            confirmAction: params.confirmAction,
            cancelAction: params.cancelAction
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
            cancelAction: params.cancelAction
        })

    },

    //@params={content:'内容<button click="confirm"></button>',initialize:function(){},confirm:function(){}}
    popup: function (params) {
        var ret = {

            find: function (selector) {
                return $container.find(selector)
            },

            hide: function () {
                ($('.cp_popup__container').length == 1) && $mask.removeClass('show');

                $container.removeClass('show');
            }
        };

        var $container = $('<div class="cp_popup__container"></div>')
            .on($.fx.transitionEnd, function () {
                if (!$(this).hasClass('show')) {

                    this.parentNode && this.parentNode.removeChild(this);
                }
            })
            .on('click', '[click]', function (e) {

                params[$(e.currentTarget).attr('click')].call(ret, e);

            })

        if (params.className) $container.addClass(params.className);

        $container.append(params.content)

        $container.appendTo('body');

        showMask();

        $container.addClass('show');

        return ret;
    },

    hidePopup: function () {
        $mask.removeClass('show');

        $('.cp_popup__container').removeClass('show');
    }

};
