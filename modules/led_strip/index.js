var Skynet = require("../skynet");
var LightStrips = require('./LPD8806').LightStrips;
var animations = require('./animations/animations');

var ledStrip = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(this, options.skynet);

	var spiDevice;
	if (options.spiDevice) {
		spiDevice = options.spiDevice;
	} else {
		var spi = require("spi");
		spiDevice = new spi.Spi(device, {
                                        //"mode": spi.MODE['MODE_0'],
                                        //"chipSelect": spi.CS['none'],
                                        //"maxSpeed": 1000000,
                                        //"bitOrder":spi.ORDER.msb
                                    });
	}
	this.lights = new LightStrips('/dev/spidev0.0', options.leds, spiDevice);

	this.state = {
		"power": false
		/*
		"color": {
			"r": 0,
			"g": 0,
			"b": 0
		},
		"animation": {
			"name": "",
			"duration": 0,
			"after": "loop"
		}
		*/
	};
	this.skynet.onGetState(this.getState);
	this.skynet.onSetState(this.setState);
	this.skynet.onMessageToMe(this.receivedMessageToMe);
};

ledStrip.prototype.getState = function() {
	return this.state;
};

ledStrip.prototype.setState = function(stateData) {
	if (typeof stateData.power !== "undefined") {
		if (this.state.power && !stateData.power) {
			this.turnOff();
		}
		if (!this.state.power && stateData.power) {
			this.turnOn();
		}
	}
	if (typeof stateData.color !== "undefined") {
		console.log("setting color",stateData.color);
		this.setColor(stateData.color);
	}
};

ledStrip.prototype.receivedMessageToMe = function(data) {
};

ledStrip.prototype.animate = function(animationData) {
	var animation = animations.load(animationName, this.lights, this.options.leds);
	animation.start();
};

ledStrip.prototype.setColor = function(colorData) {
	this.lights.all(colorData.r, colorData.g, colorData.b);
	this.lights.sync();
	this.state.power = true;
	this.state.color = colorData;
};

ledStrip.prototype.turnOff = function() {
	this.lights.off();
	this.state.power = false;
};

ledStrip.prototype.turnOn = function() {
	this.setColor({
		"r": 255,
		"g": 255,
		"b": 255
	});
};

module.exports = ledStrip;