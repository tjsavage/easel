var Pulse = require("./pulse");
var Rainbow = require("./rainbow");

module.exports.load = function(animationName, setter, duration, options) {
	if (animationName === "pulse") {
		return new Pulse(setter, duration, options);
	} else if (animationName == "rainbow") {
		return new Rainbow(setter, duration, options);
	}
};

