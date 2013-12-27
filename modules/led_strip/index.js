var Skynet = require("../skynet");
var LightStrips = require('./LPD8806').LightStrips;
//var animations = require('./animations/a');
var util = require("./util");

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
		}
		/*
		"animation": {
			"name": "",
			"duration": 0,
			"after": "loop"
		}
		*/
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
	};

	this.setColor = function(colorData) {
		console.log("setting color",colorData);
		if (typeof colorData.r != 'undefined' && 
			typeof colorData.g != 'undefined' && 
			typeof colorData.b != 'undefined') {
			console.log("got rgb");
			this.lights.all(colorData.r, colorData.g, colorData.b);
			var hsvData = util.RGBtoHSV(colorData);
			colorData.h = hsvData.h;
			colorData.s = hsvData.s;
			colorData.v = hsvData.v;
		} else if (typeof colorData.h != 'undefined' && 
			typeof colorData.s != 'undefined' && 
			typeof colorData.v != 'undefined') {
			console.log("only got hsv");
			var rgbData = util.HSVtoRGB(colorData);
			this.lights.all(rgbData.r, rgbData.g, rgbData.b);
			colorData.r = rgbData.r;
			colorData.g = rgbData.g;
			colorData.b = rgbData.b;
		} else {
			console.log("didn't get any color data of note",colorData);
		}
		
		this.lights.sync();
		this.state.power = true;
		this.state.color = colorData;
	};

	this.setValue = function(valuePercentage) {

	};


	this.animate = function(animationData) {
		var animation = animations.load(animationName, this.lights, this.options.leds);
		animation.start();
	};

	this.skynet.onGetState(function() {
		return this.state;
	});

	this.skynet.onSetState(function(stateData) {
		console.log("settingState", stateData);
		if (typeof stateData.power !== "undefined") {
			console.log("setting power",stateData.power);
			if (this.state.power && !stateData.power) {
				this.turnOff();
			}
			if (!this.state.power && stateData.power) {
				this.turnOn();
			}
		}
		if (typeof stateData.color !== "undefined" && this.state.power) {
			console.log("setting color",stateData.color);
			this.setColor(stateData.color);
		}

		this.skynet.emitState(this.state);
	});

	this.turnOff();
};


module.exports = ledStrip;