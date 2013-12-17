var Skynet = require("../skynet");

var serverConfig = {
	"me": {
		"type": "server",
		"port": 3001,
		"name": "server",
		"ip": "0.0.0.0"
	}
};

var server = new Skynet(serverConfig);