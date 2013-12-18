var Skynet = require("../skynet");
var LightStrips = require('./LPD8806').LightStrips;
var animations = require('./animations/animations');

var ledStrip = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(options.skynet);
	this.lights = new LightStrips('/dev/spidev0.0', options.leds);

	this.skynet.onMessage(this.receivedMessage);
};

ledStrip.prototype.receivedMessage = function(message) {
	if (message.to != options.name) {
		return;
	}

	if (message.subject == "animate") {
		this.animate(message.body);
	}
};

ledStrip.prototype.animate = function(animationName) {
	var animation = animations.load(animationName, this.lights, this.options.leds);
	animation.start();
};

module.exports = ledStrip;