define(function (require, exports, module) {

    var $ = require('$'),
        util = require('util'),
        ua = navigator.userAgent,
        ios = util.ios,
        isAndroid = util.android,
        slice = Array.prototype.slice,
        blankFn = function () { },
        $win = $(window),
        baseUrl = $('meta[name="api-base-url"]').attr('content'),
        hybridFunctions = {};

    window.hybridFunctions = hybridFunctions;

    window.trigger = function () {
        $.fn.trigger.apply($win, arguments);
    };

    window.callJS = function (data) {
        $win.trigger(data.method, data.params);
    }

    var queue = [],
        guid = 0,
        bridge = {
            isInApp: /SLApp/.test(ua),
            isAndroid: isAndroid,
            android: isAndroid,
            ios: ios,
            versionName: isAndroid ? '1.0' : "1.0",
            exec: hybrid,
            tip: function (msg) {
                hybrid('tip', msg + "");
            },
            openInApp: function (url) {
                hybrid('openInApp', url + '');
            },
            open: function (url) {
                hybrid('open', url + '');
            },

            //@url = "http://xx.xxx.com/cmbpay/{orderid}#跳转招行支付的地址"
            cmbpay: function (url) {
                hybrid('cmbpay', url + '');
            },

            image: {

                //@callback=function(res={id:2,src:"base64OriginImg",thumbnail:'base64Thumbnail'})
                photo: function (allowsEditing, callback) {
                    if (typeof allowsEditing == 'function') callback = allowsEditing, allowsEditing = true;

                    hybrid('image', {
                        type: 'photo',
                        allowsEditing: allowsEditing

                    }, callback);
                },

                //@callback=function(res={id:2,src:"base64OriginImg",thumbnail:'base64Thumbnail'})
                camera: function (allowsEditing, callback) {
                    if (typeof allowsEditing == 'function') callback = allowsEditing, allowsEditing = true;

                    hybrid('image', {
                        type: 'camera',
                        allowsEditing: allowsEditing
                    }, callback);
                },

                //@images=[{name:"file",value:0},{name:'file2',value:1}]
                upload: function (url, data, images, crop, callback) {

                    if (typeof crop === 'function') callback = crop, crop = false;

                    if (typeof images == 'object' && !Array.isArray(images)) {
                        images = Object.keys(images).map(function (key) {
                            return {
                                name: key,
                                value: images[key]
                            }
                        });
                    }

                    hybrid('image', {
                        type: 'upload',
                        url: url,
                        data: data,
                        images: images,
                        crop: crop

                    }, callback);

                }
            },

            motion: {
                start: function () {
                    hybrid('motion', {
                        type: 'start'
                    });
                },

                stop: function () {
                    hybrid('motion', {
                        type: 'stop'
                    });
                }
            },

            contact: {
                getAll: function () {

                }
            },

            pickColor: function (f) {
                hybrid('pickColor', f);
            },

            system: {
                info: function (callback) {
                    hybrid('system', {
                        type: 'info'

                    }, callback);
                }
            },

            getDeviceToken: function (callback) {
                hybrid('getDeviceToken', callback);
            },

            statusBar: function (type) {
                hybrid('statusBar', type);
            },

            qrcode: {

                //@callback=function({code:xxxx}){}
                scan: function (callback) {
                    hybrid('qrcode', {
                        type: 'scan'

                    }, callback);
                }
            },

            assets: {

                //@return={data:[{albumId:"xx-xx",albumName:"相册"}]}
                albums: function (callback) {
                    hybrid('assets', {
                        type: 'album'

                    }, callback);
                },

                //@params = { albumId:"xx-xx-xx", page:1, pageSize:20, size:120 }
                //@return={ albumId:'xx-xx-xx',data:[{id:'xx-xx-xx',src:'base64ImgString'}]}
                thumbnails: function (params, callback) {

                    hybrid('assets', {
                        type: 'thumbnails',
                        albumId: params.albumId,
                        width: params.size || 120,
                        height: params.size || 120,
                        page: params.page || 1,
                        pageSize: params.pageSize || 50

                    }, callback);

                },

                image: function (albumId, assetId, callback) {

                    hybrid('assets', {
                        type: 'image',
                        albumId: albumId,
                        assetId: assetId

                    }, callback);
                }
            },

            //@callback = function({longitude,latitude})
            getLocation: function (callback) {
                hybrid('getLocation', callback);
            },
            alipay: function (data, f) {
                hybrid('pay', data, f);
            },
            wx: function (data, f) {
                hybrid('wx', data, f);
            },
            ali: function (data, f) {
                hybrid('ali', data, f);
            },
            qq: function (data, f) {
                hybrid('qq', data, f);
            },
            share: function () {
                hybrid('share');
            },
            isDevelopment: navigator.platform == "Win32" || navigator.platform == "Win64",
            url: function (url) {
                return /^http\:\/\//.test(url) ? url : (baseUrl + url);
            },
            post: function (url, data, files, callback) {
                callback = typeof files === 'function' ? files : callback;
                files = typeof files === 'function' ? null : files;

                hybrid('post', {
                    url: this.url(url),
                    files: files,
                    data: data
                }, callback);
            },
            exit: function () {
                hybrid('exit');
            },
            update: function (updateUrl, versionName, f) {

                if (isAndroid) {
                    hybrid('updateApp', {
                        downloadUrl: updateUrl,
                        versionName: versionName
                    }, f);
                } else {
                    this.open(updateUrl);
                }
            }
        };

    function hybrid(method, params, hybridCallback) {
        var data, hybridReturn;

        if (typeof method == 'object') {
            hybridCallback = data.callback;

        } else {
            if (typeof params === "function") hybridCallback = params, params = null;
            data = {
                method: method,
                params: params
            }
        }

        if (typeof hybridCallback == "function") {
            hybridReturn = "hybridCallback" + (++guid);

            data.callback = hybridReturn;
            hybridFunctions[hybridReturn] = function () {
                hybridCallback.apply(null, arguments);
                delete hybridFunctions[hybridReturn];
            };
        }

        console.log(data);

        if (bridge.isInApp)
            alert('slapp://' + JSON.stringify(data));

        else if (data.method == 'system' && data.params.type == "info") {
            hybridFunctions[data.callback]({});
        }
    }

    bridge.hasStatusBar = bridge.isInApp && util.ios && util.osVersion >= 7;

    return bridge;
});