var util = require("util");
var Animation = require("./animation");

var STEPS = 100;

function Rainbow(setter, duration, options) {
	Animation.call(this, setter, duration, options);
}
util.inherits(Rainbow, Animation);

Rainbow.prototype.refresh = function(percentComplete) {
	var newHue = percentComplete * 360.0;
	this.setter.setHue(newHue);
	this.setter.emitState();
	this.setter.all();
};


module.exports = Rainbow;