var Skynet = require("../skynet");

var alarmClock = function(app, options) {
	this.options = options;
	this.skynet = new Skynet(this, options.skynet);


	this.state = {
		"name": this.options.skynet.me.name,
		"type": "alarm_clock",
		"armed": false,
		"alarmTime": {
			"hour": 6,
			"minute": 30
		}
	};

	var T = this;
	this.skynet.onGetState(function() {
		return T.state;
	});

	this.skynet.onSetState(function(stateData) {
		if (typeof stateData.alarmTime != "undefined") {
			T.changeAlarmTime(stateData.alarmTime);
		}
		if (typeof stateData.armed != "undefined") {
			T.state.armed = stateData.armed;
		}
		this.skynet.emitState(T.state);
	});

	this.tick();
};

alarmClock.prototype.tick = function() {
	if (this.state.armed) {
		var date = new Date();
		if (date.getMinutes() == this.state.alarmTime.minute && date.getHours() == this.state.alarmTime.hour) {
			this.triggerAlarm();
		}
	}
	var T = this;
	this.tickHandle = setTimeout(function() {
		T.tick.call(T);
	}, 60000);
};

alarmClock.prototype.triggerAlarm = function() {
	this.skynet.setState(this.options.ledStripName, {
		"power": true,
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
		this.state.alarmTime.hour = newAlarmTime.hour;
	}
	if (typeof newAlarmTime.minute != "undefined") {
		this.state.alarmTime.minute = newAlarmTime.minute;
	}
	
};

module.exports = alarmClock;