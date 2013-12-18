var config = {
	"name": "pablo"
	"ip": "10.0.1.21",
	"modules": [
		{
			"type": "doorbell",
			"options": {

			}
		},
		{
			"type": "logic",
			"options": {
				"conditionals": [
					{
						"if": {
							"from": "bed_motion_detector"
						},
						"then": {
							"to": "bed_led_strip",
							"body": "nightlight"
						}
					}
				]
			}
		}
	]
};

module.exports = config;
