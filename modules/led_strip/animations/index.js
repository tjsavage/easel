var Pulse = require("./pulse");

module.exports.load = function(animationName, setter, duration, options) {
	if (animationName === "pulse") {
		return new Pulse(setter, duration, options);
	}
};

