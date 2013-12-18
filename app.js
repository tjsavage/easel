var config;
if (process.argv.length > 2) {
	config = require('./' + process.argv[2]);
} else {
	config = require('./config');
}

var express = require('express');

var app = express();
app.config = config;

// all environments
app.set('port', process.env.PORT || 3000);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

console.log(config);
config.modules.forEach(function(module) {
	require("./modules/" + module.type)(app, module.options);
});


