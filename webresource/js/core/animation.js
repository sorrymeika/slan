﻿var $ = require("$");
var LinkList = require("./linklist");
var Matrix2D = require("graphics/matrix2d");
var tween = require("graphics/tween");
var CubicBezier = require("graphics/cubicBezier");
var util = require("util");

var list = new LinkList();
var animationStop = true;
var TRANSFORM = $.fx.cssPrefix + 'transform',
    defaultStyle = {
        opacity: 1
    },
    numReg = /\d+\.\d+|\d+/g,
    percentReg = /(\d+\.\d+|\d+)\%/g,
    translatePercentReg = /translate\((\-{0,1}\d+(?:\.\d+){0,1}(?:\%|px){0,1})\s*\,\s*(\-{0,1}\d+(?:\.\d+){0,1}(?:\%|px){0,1})\)/,
    matrixReg = /matrix\((\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\,\s*(\-{0,1}\d+\.\d+|\-{0,1}\d+)\s*\)/,
    matrixEndReg = /matrix\([^\)]+\)\s*$/;

var re_transform_all = /(translate|skew|rotate|scale|matrix)(3d){0,1}\(([^\)]+)\)/g;
var re_transform = /^(matrix|translate|skew|rotate|scale|invert)(3d){0,1}$/;


var toFloatArr = function (arr) {
    var result = [];
    $.each(arr, function (i, item) {
        result.push(isNaN(parseFloat(item)) ? 0 : parseFloat(item))
    });
    return result;
}

var getCurrent = function (from, end, d) {
    return parseFloat(from) + (parseFloat(end) - parseFloat(from)) * d;
}

var getMatrixByTransform = function (transform) {
    var matrix = new Matrix2D();
    transform.replace(re_transform_all, function ($0, $1, is3d, $2) {
        matrix[$1 == 'matrix' ? 'append' : $1].apply(matrix, toFloatArr($2.split(',')));
    });

    return matrix;
}

var toTransform = function (css) {
    var result = {},
        origTransform,
        matrix;

    $.each(css, function (key, val) {
        var m = key.match(re_transform);
        if (m) {
            if (key === 'translate') {
                val = (result[TRANSFORM] || '') + ' ' + key + '(' + val + ') translateZ(0)';

            } else {
                if (!matrix) matrix = new Matrix2D();
                origTransform = (result[TRANSFORM] || '');
                val = matrix[key == 'matrix' ? 'append' : key].apply(matrix, toFloatArr(val.split(','))).toString();
                val = matrixEndReg.test(origTransform) ? origTransform.replace(matrixEndReg, val) : (origTransform + ' ' + val);
            }
            key = TRANSFORM;

        } else if (key === 'transform') {
            key = TRANSFORM;
            matrix = null;
        }
        result[key] = val;
    });

    return { css: result, matrix: matrix };
};

exports.transform = toTransform;

$.fn.transform = function (css) {
    this.css(toTransform(css).css);

    return this;
};

$.fn.matrix = function (matrix) {
    if (matrix instanceof Matrix2D) {
        this.css(TRANSFORM, matrix.toString());

        return this;
    } else
        return getMatrixByTransform(getComputedStyle(this[0], null)[TRANSFORM]);
};

var run = function () {
    if (list.length) {
        animationStop = false;

        var timeUse,
            arr,
            flag = false,
            startTime = +new Date,
            item = list._idlePrev,
            nextItem;

        while (item && item != list) {
            nextItem = item._idlePrev;
            first = item.data;

            timeUse = Date.now() - first.startTime;
            arr = [];

            if (timeUse <= first.duration) {

                first.step(first.ease instanceof CubicBezier ? first.ease.get(timeUse / first.duration) : first.ease(timeUse, first.from, first.to - first.from, first.duration) / 100, timeUse, first.duration);

            } else {
                first.step(first.to / 100, first.duration, first.duration);

                list._remove(item);

                first.finish && first.finish(first.to / 100);
            }

            item = nextItem;
        }

        requestAnimationFrame(run);
    } else {
        animationStop = true;
    }
};

var init = function (item) {
    var ease = item.ease;

    item.startTime = Date.now();

    !ease && (item.ease = tween.easeOut) || (typeof ease == "string") && (item.ease = ease.indexOf('cubic-bezier') == 0 ? new CubicBezier(ease) : tween[ease.replace(/\-([a-z])/g, function ($0, $1) {
        return $1.toUpperCase();
    })]);

    item.stop = function () {
        list.remove(item);
    };
    if (item.from === void 0) item.from = 0;
    if (item.to === void 0) item.to = 100;
    if (!item.duration) item.duration = 300;

    return item;
}

var parallel = function (animations) {
    for (var i = 0, n = animations.length, item; i < n; i++) {
        list.append(init(animations[i]));
    }

    if (animationStop) run();
}

var eachStep = function (d) {
    var style,
        originStyle,
        originVal,
        val,
        newStyle;

    this.el.each(function () {
        style = this._animationStyle;
        originStyle = this._originStyle;

        if (d == 0) {
            newStyle = originStyle;
        } else if (d < 1) {
            newStyle = {};
            for (var key in style) {
                val = style[key];
                originVal = originStyle[key];

                if (key == TRANSFORM) {
                    var m = originVal.match(matrixReg) || ['', 1, 0, 0, 1, 0, 0];
                    var i = 0;
                    var matrix = getMatrixByTransform(val);

                    for (var i = 0; i < 6; i++) {
                        matrix[i] = getCurrent(m[i + 1], matrix[i], d);
                    }
                    newStyle[key] = matrix.toString() + ' translateZ(0)';

                } else if (!isNaN(parseFloat(val))) {
                    originVal = isNaN(parseFloat(originVal)) ? defaultStyle[key] || 0 : parseFloat(originVal);
                    newStyle[key] = getCurrent(originVal, val, d);
                } else {
                    newStyle[key] = val;
                }
            }
        } else {
            newStyle = style;
        }
        $(this).css(newStyle);
    });

    this._step && this._step(d);
}

var animationEnd = function (per) {
    if (per == 1) this.el.css(this.css);
    this._finish && this._finish(per);
}

var prepare = function (animations) {
    var item,
        $el,
        el,
        css,
        m2d,
        origTransform;

    for (var i = 0, n = animations.length; i < n; i++) {
        item = animations[i];

        if (item.css) {
            css = toTransform(item.css);
            item.matrix = css.matrix;
            item.css = css.css;

            $el = item.el = $(item.el);

            if (typeof item.start === 'object') {
                $el.transform(item.start);
            }

            $el.each(function () {
                var el = this,
                    animationStyle = {},
                    originStyle = {},
                    style = getComputedStyle(el, null);

                $.each(item.css, function (key, val) {
                    if (typeof val === 'string') {
                        if (key == TRANSFORM) {
                            val = val.replace(translatePercentReg, function ($0, $1, $2) {
                                return 'translate(' + ($1.indexOf('%') !== -1 ? el.offsetWidth * parseFloat($1) / 100 : parseFloat($1)) + 'px,' + ($2.indexOf('%') !== -1 ? el.offsetHeight * parseFloat($2) / 100 : parseFloat($2)) + 'px)';
                            });
                            //console.log(val)

                        } else if (/^(top|margin(-t|T)op)$/.test(key)) {
                            val = val.replace(percentReg, function ($0) {
                                return el.parentNode.offsetHeight * parseFloat($0) / 100 + "px";
                            });

                        } else if (/^(left|margin(-l|L)eft|padding(-l|L)eft|padding(-t|T)op)$/.test(key)) {
                            val = val.replace(percentReg, function ($0) {
                                return el.parentNode.offsetWidth * parseFloat($0) / 100 + "px";
                            });
                        }
                    }

                    originStyle[key] = style[key];
                    animationStyle[key] = val;
                });

                el._animationStyle = animationStyle;
                el._originStyle = originStyle;
                //console.log('new',animationStyle,'original',originStyle);
            });

            item._step = item.step;
            item.step = eachStep;

            item._finish = item.finish;
            item.finish = animationEnd;
        }
    }

    return animations;
}

var Animation = function (animations) {
    if (!$.isArray(animations)) animations = [animations];

    prepare(animations);

    this.list = animations;
}

Animation.prototype.step = function (percent) {
    var item,
        list = this.list;

    this.per = percent;

    for (var i = 0, length = list.length; i < length; i++) {
        item = list[i];
        item.from = percent;
        item.step(percent / 100);
    }
    return this;
}

Animation.prototype.animate = function (duration, percent, callback) {
    var item,
        animations = this.list;

    for (var i = 0, length = animations.length; i < length; i++) {
        item = animations[i];
        item.duration = duration;
        item.to = percent;
        item.finish = item.start = void 0;
    }

    item.finish = callback;

    parallel(animations);

    return this;
}

exports.Animation = Animation;

/*@animations=[{ 
    el: 'div', 
    css: {translate:0%,0%,scale:.3,.3}, 
    start=null|{color:#xxx, ...}, 
    finish: function() {}
}, ...]*/
exports.parallel = function (animations) {
    parallel(prepare(animations));
};

//@arguments=from, end, d
exports.step = getCurrent;

//@arguments=[el,css]|step=function(d){},duration,ease,finish
exports.animate = function () {
    var args = arguments,
        item = {},
        i = 0,
        el = args[i++];

    if (typeof el === 'function') {
        item.step = el;

    } else {
        item.el = el;
        item.css = args[i++];
    }
    item.duration = args[i++];
    item.ease = args[i++];
    item.finish = args[i];

    parallel([item]);

    return item;
};
