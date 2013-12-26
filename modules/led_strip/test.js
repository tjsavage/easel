var should = require('should');
var io = require('socket.io-client');
var Skynet = require('../skynet');
var LedStrip = require('../led_strip');
var sinon = require("sinon");

var client1Config = {
	"name": "client1",
	"skynet": {
		"me": {
			"name": "client1",
			"type": "client",
			"port": 3002,
			"ip": "localhost"
		},
		"server": {
			"port": 3001,
			"ip": "127.0.0.1"
		}
	}
};

var mockSpiDevice = {
	open: sinon.spy(),
	write: sinon.spy()
};

var ledConfig = {
	"name": "test_led_strip",
	"leds": 2,
	"skynet": {
		"me": {
			"type": "client",
			"name": "test_led_strip",
			"port": 3002
		},
		"server": {
			"name": "server",
			"port": 3001,
			"ip": "127.0.0.1"
		}
	},
	"spiDevice": mockSpiDevice
};

describe("led_strip", function() {
	
	it("should announce when it connects", function(done) {
		var client1 = new Skynet(null, client1Config.skynet);
		client1.context = client1;

		client1.onClientConnected(ledConfig.name, function() {
			client1.disconnect();
			leds.skynet.disconnect();
			done();
		});

		var leds = new LedStrip(null, ledConfig);
		
	});

	it("should announce its power state correctly when asked", function(done) {
		var client1 = new Skynet(null, client1Config.skynet);
		client1.context = client1;
		var numStates = 0;

		client1.onClientConnected(ledConfig.name, function() {
			client1.requestState();
		});

		var leds;

		client1.onReceiveState(function(data) {
			if (data.from === ledConfig.name) {
				data.body.power.should.equal(false);
				client1.disconnect();
				leds.skynet.disconnect();
				done();
			}
		});

		leds = new LedStrip(null, ledConfig);
	});
	
	it("should turn on and off when the function is called", function(done) {
		var leds = new LedStrip(null, ledConfig);
		leds.turnOff();
		mockSpiDevice.write.called.should.equal(true);
		done();

	});
	
	// this one seems to be a little non-deterministic. oops.
	it("should turn on and off when asked", function(done) {
		var client1 = new Skynet(null, client1Config.skynet);
		client1.context = client1;
		var leds = new LedStrip(null, ledConfig);
		leds.turnOff();

		var receivedLedState = false;
		client1.onReceiveState(function(data) {

			if (data.from === ledConfig.name) {
				if (!receivedLedState) {
					data.body.power.should.equal(false);
					client1.setState(ledConfig.name, {
							"power": true
					});
					receivedLedState = true;

					client1.requestState();
				} else {
					if (data.body.power) {
						leds.skynet.disconnect();
						client1.disconnect();
						done();
					}
					
				}
			}
		});

		client1.requestState();
	});

	it("should set the color when asked", function(done) {
		var client1 = new Skynet(null, client1Config.skynet);
		client1.context = client1;
		var leds = new LedStrip(null, ledConfig);
		leds.turnOn();

		var receivedLedState = false;
		client1.onReceiveState(function(data) {

			if (data.from === ledConfig.name) {
				if (!receivedLedState) {
					data.body.power.should.equal(true);
					client1.setState(ledConfig.name, {
							"color": {
								"r": 1,
								"g": 2,
								"b": 3
							}
					});
					receivedLedState = true;

					client1.requestState();
				} else {
					console.log("got body",data.body);
					if (data.body.color.r == 1 && data.body.color.g == 2 && data.body.color.b == 3) {
						leds.skynet.disconnect();
						client1.disconnect();
						done();
					}
					
				}
			}
		});

		client1.requestState();
	});

});