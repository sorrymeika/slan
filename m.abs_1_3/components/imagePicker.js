var $ = require('$');
var util = require('util');
var popup = require('widget/popup');
var Toast = require('widget/toast');

var Model = require('core/model2').Model;
var bridge = require('bridge');


var imagePicker;

module.exports = {
    show: function (allowsEditing, title, callback) {
        if (allowsEditing !== false) callback = title, title = allowsEditing, allowsEditing = true;

        var options = [{
            text: '从相册选择图片',
            click: function () {
                bridge.image.photo(allowsEditing, function (res) {
                    imagePicker.hide();
                    imagePicker = null;

                    callback(res);
                });
            }
        }, {
            text: '拍照',
            click: function () {
                bridge.image.camera(allowsEditing, function (res) {
                    imagePicker.hide();
                    imagePicker = null;

                    callback(res);
                });
            }
        }, {
            text: '取消',
            click: function () {
                this.hide();
            }
        }];

        if (typeof title === 'function') callback = title, title = null;
        else options.unshift({
            text: title
        })

        imagePicker = popup.options({
            options: options
        })

    },

    hide: function () {

        imagePicker && imagePicker.hide();
    }
}