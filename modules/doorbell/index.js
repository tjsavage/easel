var path = require('path');
var express = require('express');
var http = require('http');

var routes = require("./routes");

var doorbell = function(app, options) {
    // all environments
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(require('stylus').middleware(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/doorbell/twilio', routes.get_twilio);
    app.get('/doorbell/lock', routes.get_lock);
    app.post('/doorbell/lock', routes.post_lock);

    http.createServer(app).listen(app.get('port'), function(){
      console.log('Express server listening on port ' + app.get('port'));
    });
}


module.exports = doorbell;
