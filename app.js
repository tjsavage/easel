var http = require("http");
var path = require("path");

var config;
if (process.argv.length > 2) {
	config = require('./' + process.argv[2]);
} else {
	config = require('./config');
}

var express = require('express');

var app = express();
var server = http.createServer(app);

app.config = config;
app.server = server;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

console.log(config);
config.modules.forEach(function(module) {
	require("./modules/" + module.type)(app, module.options);
});

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
