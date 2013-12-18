var gpio = require("gpio");

var motionDetector = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(options.skynet);

	this.gpioPin = gpio.export(options.pin, {
		direction: "in",
		ready: function() {
		}
	});

	this.gpioPin.on("change", function(val) {
		console.log("changed motion detector pin to " + val);
		onMotion();
	});

	function onMotion() {
		this.skynet.emitMessage({
			"from": this.options.name,
			"body": "motion"
		});
	}
};