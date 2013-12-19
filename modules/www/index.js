var express = require("express");
var path = require("path");
var Skynet = require("../skynet");

/**
 * Module dependencies.
 */
module.exports = function(app, options) {
	var io = require("socket.io").listen(app);
	// all environments
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware(path.join(__dirname, 'public')));


	app.get("/", function(req, res) {
		res.render('index', {});
	});

	var skynet = new Skynet(options.skynet);

	io.sockets.on('connection', function(socket) {
		socket.emit("site connected", {});
		socket.on("message", function(data) {
			skynet.emitMessage(data);
		});
	})
}

