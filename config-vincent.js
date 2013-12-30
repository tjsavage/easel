var config = {
	"name": "vincent",
	"ip": "10.0.1.19",
	"modules": [
		{
			"type": "skynet",
			"options": {
				"me": {
					"type": "server",
					"name": "skynet-server",
					"port": 3001
				}
			}
		},
		{
			"type": "doorbell",
			"options": {

			}
		},
		{
			"type": "www",
			"options": {
				"skynet": {
					"me": {
						"type": "client",
						"name": "www",
						"port": 3002
					},
					"server": {
						"name": "vincent",
						"port": 3001,
						"ip": "10.0.1.19"
					}
				}
			}
		}
	]
};

module.exports = config;
