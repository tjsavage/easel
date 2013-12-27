var config = {
	"name": "test",
	"ip": "127.0.0.1",
	"modules": [
		{
			"type": "www",
			"options": {
				"skynet": {
					"me": {
						"type": "client",
						"name": "test-www",
						"port": 3002
					},
					"server": {
						"name": "server",
						"port": 3001,
						"ip": "127.0.0.1"
					}
				}
			}
		},
		{
			"type": "led_strip",
			"options": {
				"leds": 32,
				"spiDevice": {
					"open": function() {},
					"write": function() {}
				},
				"skynet": {
					"me": {
						"type": "client",
						"name": "test-led",
						"port": 3003
					},
					"server": {
						"name": "server",
						"port": 3001,
						"ip": "127.0.0.1"
					}
				}
			}
			
		}
	]
};

module.exports = config;