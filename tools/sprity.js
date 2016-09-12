var fs = require('fs');
var fse = require('../core/fs');
var path = require('path');

var Canvas = require('canvas');
var Image = Canvas.Image;


function combineImages(dist, srcs) {
    var count = 0;
    var images = [];

    srcs.forEach(function (src) {
        count++;

        fs.readFile(src, function (err, src) {

            if (err) throw err;
            var img = new Image;
            img.src = src;

            images.push(img);

            count--;

            if (count == 0) {

                images.sort(function (a, b) {
                    return a.width > b.width ? 1 : a.width < b.width ? -1 : 0;
                });

                var maxWidth = images[0].width;
                var height = images[0].height;

                images[0].top = 0;
                images[0].left = 0;
                for (var i = 1, j = images.length - 1; i < j; i++) {
                    img = images[i];
                    if (i == 1) {
                        img.left = 0;
                        img.top = height;
                    } else {

                    }

                }

                var canvas = new Canvas(200, 200);
                var ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0, img.width / 4, img.height / 4);
            }
        });
    });
}

export.create = function (src, dist, cb) {
    fs.readdir(path.join(__dirname, src), function (err, files) {
        if (err) {
            return cb(err);
        }

        var count = 0;
        var rootImages = [];

        list.forEach(function (file) {
            count++;

            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {

                if (stat && stat.isDirectory()) {

                    fse.find(file, '*.(png|jpg|jpeg)', function (err, images) {
                        combineImages(dist, images);
                    });

                } else {
                    var ext = path.extname(file);

                    if (/^\.(png|jpg|jpeg)$/.test(ext)) {
                        rootImages.push(file);
                    }
                }
                count--;

                if (count == 0) {
                    combineImages(dist, rootImages);
                }
            }
        }

    });
}