const express = require('express'),
	path = require('path'),
	bodypareser = require('body-parser'),
	fs = require('fs'),
	morgan = require('morgan'),
	cors = require("cors"),
	routes = require('./lib/routes');

var dbcreation = require('./lib/config/dbCreation');
var app = express();
let http = require('http').Server(app);

app.all("/api/*", function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
	return next();
});

app.use(bodypareser.urlencoded({
	limit: '20mb',
	extended: true
}));
app.use(bodypareser.json({
	limit: '20mb'
}));

app.use(express.static(path.join(__dirname, 'app_main')));

routes.configure(app);

dbcreation.createDB();

var server = app.listen(parseInt(8802), function () {
	console.log('server start on port: ' + server.address().port);
})