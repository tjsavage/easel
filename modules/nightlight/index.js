var Skynet = require("../skynet");

var nightlight = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(this, options.skynet);

	var T = this;
	this.skynet.onBroadcastState(this.options.motionDetector, function(stateData) {
		console.log("got state");
		if (stateData.tripped) {
			console.log("got tripped state");
			this.skynet.setState(T.options.ledStrip, {
				"power": true,
				"color": {
					"h": 338,
					"s": .34,
					"v": .93,
				},
				"animation": {
					"name": "pulse",
					"duration": 3000,
					"options": {
						"loop": true,
						"minValue": 0.3,
						"maxValue": 0.6
					}
				}
			});
		} else {
			console.log("got untripped state");
			this.skynet.setState(T.options.ledStrip, {
				"power": false
			});
		}
	});
};

module.exports = nightlight;