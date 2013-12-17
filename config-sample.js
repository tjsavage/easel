var config = {
	"name": "pablo",
	"skynet": {
		"me": {
			"type": "client", // or "client"
			"port": 3001,
			"ip": "10.0.1.21"
		},
		"server": {
			"name": "vincent",
			"port": 3001,
			"ip": "10.0.1.19"
		}
		
	},
	"ip": "10.0.1.21",
	"scripts": {
		"setup": "example.js",
		"start": "start.js"
	}
};

module.exports = config;
