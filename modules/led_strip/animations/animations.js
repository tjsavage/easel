var Throb = require('./throb');
var LarsonScanner = require('./larsonScanner');

var animations = {
	"nightlight": require("./throb")(lights, numberOfLEDs, [255, 0, 0], [0, 0, 255], 20)
};

module.exports.load = function(animationName, lights, numLEDs) {
	if (animationName === "nightlight") {
		return new Throb(lights, numLEDs, [255, 0, 0], [0, 0, 255], 20);
	}
};