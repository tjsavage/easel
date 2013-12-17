
/**
 * Module dependencies.
 */
 var config;
if (process.argv.length > 2) {
	config = require('./' + process.argv[2])
} else {
	config = require('./config');
}

var express = require('express');
var path = require('path');

var app = express();
app.config = config;

// all environments
app.set('port', process.env.PORT || 3000);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

require("./" + config.name)(app);


