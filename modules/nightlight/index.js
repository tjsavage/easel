var Skynet = require("../skynet");
var extend = require('util')._extend;

var nightlight = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(this, options.skynet);
	this.priorLedState = null;
	this.tripped = false;

	var T = this;
	this.skynet.onBroadcastState(this.options.ledStrip, function(stateData) {
		if (!T.tripped) {
			T.priorLedState = extend({}, stateData);
		}
	});

	this.skynet.onBroadcastState(this.options.motionDetector, function(stateData) {
		if (stateData.tripped) {
			T.tripped = true;
			this.skynet.setState(T.options.ledStrip, {
				"power": true,
				"color": {
					"h": 338,
					"s": 0.34,
					"v": 0.93,
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
			T.tripped = false;
			if (typeof T.priorLedState == 'undefined' || !T.priorLedState) {
				T.priorLedState = {
					power: false
				};
			}
			console.log("priorState",T.priorLedState);
			this.skynet.setState(T.options.ledStrip, T.priorLedState);
		}
	});
};

module.exports = nightlight;