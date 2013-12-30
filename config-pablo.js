var config = {
	"name": "pablo",
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
						"name": "bed_led_strip",
						"port": 3002
					},
					"server": {
						"name": "skynet-server",
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
						"name": "bed_motion_detector",
						"port": 3003
					},
					"server": {
						"name": "skynet-server",
						"port": 3001,
						"ip": "10.0.1.19"
					}
				}
			}
		}
	]
};

module.exports = config;
