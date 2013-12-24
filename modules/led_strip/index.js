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
		"power": false,
		"color": {
			"hue": 0,
			"saturation": 0,
			"lightness": 0
		},
		"animation": {
			"name": "",
			"duration": 0,
			"after": "loop"
		}
	};
	this.skynet.onGetState(this.getState);
	this.skynet.onMessageToMe(this.receivedMessageToMe);
};

ledStrip.prototype.getState = function() {
	return this.state;
};

ledStrip.prototype.receivedMessageToMe = function(data) {
	if (typeof data.body.power !== undefined) {
		this.state.power = data.body.power;
	}
};

ledStrip.prototype.animate = function(animationName) {
	var animation = animations.load(animationName, this.lights, this.options.leds);
	animation.start();
};

ledStrip.prototype.turnOff = function() {
	this.lights.off();
};

module.exports = ledStrip;