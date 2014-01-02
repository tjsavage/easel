var Skynet = require("../skynet");

var alarmClock = function(app, options) {
	this.options = options;
	console.log(options);
	this.skynet = new Skynet(this, options.skynet);

	this.state = {
		"armed": false,
		"alarmTime": {
			"hour": 6,
			"minute": 30
		}
	};

	var T = this;
	this.skynet.onGetState(function() {
		console.log("onGetState for alarm_clock",T.state);
		return T.state;
	});

	this.skynet.onSetState(function(stateData) {
		if (typeof stateData.alarmTime != "undefined") {
			this.changeAlarmTime(stateData.alarmTime);
		}
	});
};

alarmClock.prototype.triggerAlarm = function() {
	this.skynet.setState(this.options.ledStrip, {
		"animation": {
			"name": "sunrise",
			"duration": "600000",
			"options": {
				"hold": true
			}
		}
	});
};

alarmClock.prototype.changeAlarmTime = function(newAlarmTime) {
	if (typeof newAlarmTime.hour != "undefined") {
		this.state.alarmTime.hour = newAlarmTime;
	}
	if (typeof newAlarmTime.minute != "undefined") {
		this.state.alarmTime.minute = newAlarmTime;
	}
	
};

module.exports = alarmClock;