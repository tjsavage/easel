var util = require("util");
var Animation = require("./animation");

var STEPS = 100;

function Pulse(setter, duration, options) {
	Animation.call(this, setter, duration, options);
};
util.inherits(Pulse, Animation);

Pulse.prototype.refresh = function(percentComplete) {
	var angle = (Math.PI * 2) * percentComplete;
	var value = (Math.sin(angle) + 1.0) / 2.0;

	this.setter.setValue(value);
	this.setter.all();
}


module.exports = Pulse;