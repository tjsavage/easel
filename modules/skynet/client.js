var Skynet = require("../skynet");

var serverHost = process.argv[2];
var serverPort = process.argv[3];

var client = new Skynet({
	"me": {
		"type": "client",
		"name": "test-client",
		"port": 3002
	},
	"server": {
		"name": "test-server",
		"port": 3001,
		"ip": "127.0.0.1"
	}
})