var Skynet = require("../skynet");

var logic = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(options.skynet);
};

module.exports = logic;