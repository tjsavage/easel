var util = require("util");
var Animation = require("./animation");

var STEPS = 100;

function Pulse() {
};
util.inherits(Pulse, Animation);

Pulse.prototype.refresh = function(percentComplete) {
	var angle = (Math.PI * 2) * percentComplete;
	var amplitude = (Math.sin(angle) + 1.0) / 2.0;

	
}


module.exports = Pulse;