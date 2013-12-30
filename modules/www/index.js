var express = require("express");
var path = require("path");
var Skynet = require("../skynet");

/**
 * Module dependencies.
 */
module.exports = function(app, options) {
	var io = require("socket.io").listen(app.server);
	// all environments
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware(path.join(__dirname, 'public')));


	app.get("/", function(req, res) {
		res.render('index', {socketIP: options.socketIP});
	});

	var skynet = new Skynet(this, options.skynet);

	io.sockets.on('connection', function(socket) {
		socket.emit("site connected", {});
		socket.on("message", function(data) {
			skynet.emitMessage(data);
		});
		socket.on("set:state", function(data) {
			skynet.emit("set:state", data);
		});
		socket.on("get:state", function(data) {
			skynet.emit("get:state", data);
		});

		skynet.onReceiveState(function(message) {
			socket.emit("broadcast:state", message);
		});
		/*
		skynet.onGetState(function() {
			return {};
		});*/
	});
};

