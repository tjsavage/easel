var path = require('path');
var express = require('express');
var http = require('http');

var routes = require("./routes");

var doorbell = function(app, options) {
    // all environments
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());

    app.get('/doorbell/twilio', routes.get_twilio);
    app.get('/doorbell/lock', routes.get_lock);
    app.post('/doorbell/lock', routes.post_lock);
}


module.exports = doorbell;
