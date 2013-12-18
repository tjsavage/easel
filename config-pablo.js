var config = {
	"name": "pablo"
	"ip": "10.0.1.21",
	"modules": [
		{
			"type": "led_strip",
			"options": {
				"name": "bed_led_strip",
				"leds": 32,
				"skynet": {
					"me": {
						"type": "client",
						"name": "test-leds",
						"port": 3002
					},
					"server": {
						"name": "vincent",
						"port": 3001,
						"ip": "10.0.1.19"
					}
				}
			}
		},
		{
			"type": "motion_detector",
			"options": {
				"name": "bed_motion_detector",
				"pin": 18,
				"skynet": {
					"me": {
						"type": "client",
						"name": "test-leds",
						"port": 3003
					},
					"server": {
						"name": "vincent",
						"port": 3001,
						"ip": "10.0.1.19"
					}
				}
			},
		}
	]
};

module.exports = config;
