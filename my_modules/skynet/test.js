var should = require('should');
var io = require('socket.io-client');
var Skynet = require('../skynet');

var client1Config = {
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
};

var client2Config = {
	"me": {
		"name": "client2",
		"type": "client",
		"port": 3003,
		"ip": "localhost"
	},
	"server": {
		"port": 3001,
		"ip": "127.0.0.1"
	}
};



describe("skynet", function() {
	it("Should broadcast a new connection to all clients", function(done) {
		var client1 = new Skynet(client1Config);

		client1.on("client connected", function(machine) {
			console.log("got new connection: ",machine);
			machine.name.should.equal("client2");
			client1.disconnect();
			done();
		});

		var client2 = new Skynet(client2Config);

		
	});

	it("should broadcast an event to all clients", function(done) {
		var client1 = new Skynet(client1Config);

		client1.on("event", function(data) {
			data.type.should.equal("a cool event");
			done();
		});

		var client2 = new Skynet(client2Config);

		client2.emit("event", {type: "a cool event"});
	});
});