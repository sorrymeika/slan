var express = require('express');
var fs = require('fs');

var app = express.Router();
var pools = require('./pools');

app.post('/connect', function(req, res) {
    pools.connect({
        host: req.body.host,
        user: req.body.user,
        password: req.body.password

    }, function(err, conn) {
        res.json({
            success: true
        });
        conn.release();
    });
});

app.get('/config', function(req, res) {
    res.json({
        success: true,
        data: pools.getConfig()
    });
});

app.get('/databases', function(req, res) {
    pools.connect(function(err, conn) {
        conn.query("show databases", function(err, rows, fields) {
            res.json(err ? {
                success: false,
                msg: err

            } : {
                    success: true,
                    data: rows,
                    fields: fields
                });
            conn.release();
        });

    });
});

app.get('/use', function(req, res) {

    var database = req.query.database;

    pools.connect(function(err, conn) {

        console.log('use', database);

        conn.query("use " + database, function(err, rows, fields) {

            res.json(err ? {
                success: false,
                msg: err

            } : {
                    success: true,
                    data: rows,
                    fields: fields
                });

            conn.release();
        });

    });
});

app.all('/query', function(req, res) {
    var query = req.body.query;
    var params = typeof req.body.params == 'string' ? JSON.parse(req.body.params) : [];

    console.log(query, params);

    pools.connect(function(err, conn) {

        conn.query(query, params, function(err, rows, fields) {

            res.json(err ? {
                success: false,
                msg: err

            } : {
                    success: true,
                    data: rows,
                    fields: fields
                });

            conn.release();
        });

    });
});


function getSQL(database, callback) {
    fs.readFile('./sql/' + database + '.sql.json', { encoding: 'utf-8' }, function(err, text) {
        if (err || !text) {
            callback([]);

        } else {
            callback(JSON.parse(text));
        }
    });
}

function saveSQL(database, data, callback) {
    fs.writeFile('./sql/' + database + '.sql.json', JSON.stringify(data), 'utf8', callback);
}

app.post('/get_sql', function(req, res) {
    var database = req.body.database;

    getSQL(database, function(result) {

        res.json({
            success: true,
            data: result
        });
    });
});

app.post('/save', function(req, res) {
    var query = req.body.query;
    var origin = req.body.origin;
    var database = req.body.database;

    getSQL(database, function(result) {
        if (result.indexOf(query) == -1) {
            var originIndex;
            if (origin && (originIndex = result.indexOf(origin)) !== -1) {
                result.splice(originIndex, 1);
            }
            result.unshift(query);

            saveSQL(database, result, function() {
                res.json({
                    success: true
                });
            });
        } else {
            res.json({
                success: true
            });
        }
    });
});

app.post('/delete', function(req, res) {
    var query = req.body.query;
    var database = req.body.database;

    getSQL(database, function(result) {
        result.splice(result.indexOf(query), 1);

        saveSQL(database, result, function() {
            res.json({
                success: true
            });
        });

    });
});


module.exports = app;
