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
		},
		{
			"type": "nightlight",
			"options": {
				"name": "bed_nightlight",
				"motionDetector": "bed_motion_detector",
				"ledStrip": "bed_led_strip",
				"skynet": {
					"me": {
						"type": "client",
						"name": "bed_nightlight",
						"port": 3004
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
			"type": "alarm_clock",
			"options": {
				"name": "alarm_clock",
				"ledStripName": "bed_led_strip",
				"wakeupMinutes": 30,
				"skynet": {
					"me": {
						"type": "client",
						"name": "alarm_clock",
						"port": 3005
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
