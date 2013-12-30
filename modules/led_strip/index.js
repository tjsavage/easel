var Skynet = require("../skynet");
var LightStrips = require('./LPD8806').LightStrips;
var animations = require('./animations');
var util = require("./util");

var ledStrip = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(this, options.skynet);

	var spiDevice;
	if (options.spiDevice) {
		spiDevice = options.spiDevice;
	} else {
		var spi = require("spi");
		var device = '/dev/spidev0.0';
		spiDevice = new spi.Spi(device, {
                                        //"mode": spi.MODE['MODE_0'],
                                        //"chipSelect": spi.CS['none'],
                                        //"maxSpeed": 1000000,
                                        //"bitOrder":spi.ORDER.msb
                                    });
	}
	this.lights = new LightStrips('/dev/spidev0.0', options.leds, spiDevice);

	this.state = {
		"name": this.options.skynet.me.name,
		"type": "led_strip",
		"power": false,
		"color": {
			"r": 0,
			"g": 0,
			"b": 0,
			"h": 0,
			"s": 0,
			"v": 0
		},
		"animation": null
	};

	this.turnOn = function() {
		console.log("turning on");
		this.setColor({
			"r": 255,
			"g": 255,
			"b": 255
		});
		this.state.power = true;
	};

	this.turnOff = function() {
		console.log("turning off");
		this.setColor({
			"r": 0,
			"g": 0,
			"b": 0
		});
		this.state.power = false;
		if (this.animation) {
			this.animation.stop();
			this.animation = null;
		}
		this.state.animation = null;
		this.lights.off();
	};

	this.setColor = function(colorData) {
		console.log("setting color",colorData);
		var newColorData = this.state.color;
		var rgbChanged = false;
		var hsvChanged = false;
		if (typeof colorData.r != 'undefined') {
			newColorData.r = colorData.r;
			rgbChanged = true;
		}
		if (typeof colorData.g != 'undefined') {
			newColorData.g = colorData.g;
			rgbChanged = true;
		}
		if (typeof colorData.b != 'undefined') {
			newColorData.b = colorData.b;
			rgbChanged = true;
		}
		if (typeof colorData.h != 'undefined') {
			newColorData.h = colorData.h;
			hsvChanged = true;
		}
		if (typeof colorData.s != 'undefined') {
			newColorData.s = colorData.s;
			hsvChanged = true;
		}
		if (typeof colorData.v != 'undefined') {
			newColorData.v = colorData.v;
			hsvChanged = true;
		}
		if (hsvChanged && !rgbChanged) {
			var newRGBData = util.HSVtoRGB(newColorData);
			newColorData.r = newRGBData.r;
			newColorData.g = newRGBData.g;
			newColorData.b = newRGBData.b;
		} else if (rgbChanged && !hsvChanged) {
			var newHSVData = util.RGBtoHSV(newColorData);
			newColorData.h = newHSVData.h;
			newColorData.s = newHSVData.s;
			newColorData.v = newHSVData.v;
		}
		
		this.state.power = true;
		this.state.color = newColorData;
	};

	this.setValue = function(valuePercentage) {
		this.setColor({
			v: valuePercentage
		});
	};

	this.setHue = function(newHue) {
		this.setColor({
			h: newHue
		});
	};

	this.emitState = function() {
		this.skynet.emitState(this.state);
	};

	this.all = function() {
		this.lights.all(this.state.color.r, this.state.color.g, this.state.color.b);
		this.lights.sync();
	};


	this.setAnimation = function(animationData) {
		console.log("setting animation",animationData);
		if (typeof this.animation != "undefined" && this.animation) {
			this.animation.stop();
		}
		if (!animationData) {
			this.animation = null;
			this.state.animation = null;
			return;
		}
		var animation = animations.load(animationData.name, this, animationData.duration, animationData.options);
		this.animation = animation;
		this.state.animation = animationData;
		this.animation.start();
	};

	var T = this;

	this.skynet.onGetState(function() {
		console.log("ongetState for led_strip", T.state);
		console.log("led_strip options",T.options);
		return T.state;
	});

	this.skynet.onSetState(function(stateData) {
		console.log("settingState", stateData);
		if (typeof stateData.power !== "undefined") {
			console.log("setting power",stateData.power);
			if (T.state.power && !stateData.power) {
				T.turnOff();
			}
			if (!T.state.power && stateData.power) {
				T.turnOn();
			}
		}
		if (typeof stateData.color != "undefined" && T.state.power) {
			console.log("setting color",stateData.color);
			T.setColor(stateData.color);
		}
		if (typeof stateData.animation == "undefined" && T.state.power) {
			T.all();
		}
		if (typeof stateData.animation != "undefined" && T.state.power) {
			T.setAnimation(stateData.animation);
		}

		T.skynet.emitState(this.state);
	});

	this.turnOff();
};


module.exports = ledStrip;