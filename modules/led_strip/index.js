var Skynet = require("../skynet");
var LightStrips = require('./LPD8806').LightStrips;
var animations = require('./animations/animations');

var ledStrip = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(options.skynet);
	this.lights = new LightStrips('/dev/spidev0.0', options.leds);

	this.skynet.setStatusGetter(this.getStatus);
	this.skynet.onMessageToMe(this.receivedMessageToMe);
	this.status = {};
};

ledStrip.prototype.getStatus = function() {
	return [
		{
			"name": "power",
			"type": "toggle",
			"displayName": "power",
			"status": this.status.power
		}
	]
}

ledStrip.prototype.receivedMessageToMe = function(data) {
	this.status = data;
}

ledStrip.prototype.animate = function(animationName) {
	var animation = animations.load(animationName, this.lights, this.options.leds);
	animation.start();
};

module.exports = ledStrip;