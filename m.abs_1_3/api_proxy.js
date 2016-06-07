var express = require('express');
var app = express();

var http_proxy = require('../core/http_proxy');
app.all('*', http_proxy('localhost', 6004));

app.listen(6005);
