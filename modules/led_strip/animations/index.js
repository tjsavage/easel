var Pulse = require("./pulse");
var Rainbow = require("./rainbow");
var Sunrise = require("./sunrise");

module.exports.load = function(animationName, setter, duration, options) {
	if (animationName === "pulse") {
		return new Pulse(setter, duration, options);
	} else if (animationName == "rainbow") {
		return new Rainbow(setter, duration, options);
	} else if (animationName == "sunrise") {
		return new Sunrise(setter, duration, options);
	}
};

