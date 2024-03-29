var gpio = require("gpio");
var Skynet = require("../skynet");

var motionDetector = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(this, options.skynet);
	this.state = {
		"tripped": false,
		"lastTripped": null
	};

	var gpioPin = gpio.export(options.pin, {
		direction: "in",
		ready: function() {
			console.log("motion detector ready");
		}
	});

	var T = this;

	gpioPin.on("change", function(val) {
		console.log("changed motion detector pin to ", val);
		if (val == 1) {
			console.log("tripped motion detector");
			T.state.tripped = true;
			T.state.lastTripped = (new Date()).toString();
		} else {
			T.state.tripped = false;
		}
		T.skynet.emitState(T.state);
	});


	this.skynet.onGetState(function() {
		return T.state;
	});
};

module.exports = motionDetector;