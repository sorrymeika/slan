var express = require('express');

var app = express.Router();

app.all("/get", function(req, res) {

    res.json({});
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

module.exports = app;
