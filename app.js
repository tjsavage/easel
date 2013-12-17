
/**
 * Module dependencies.
 */
var config = require('./config');

var express = require('express');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

require("./" + config.name)(app);


