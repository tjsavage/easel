_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

Handlebars.registerHelper("asPercent", function(number) {
	return Math.floor(number * 100);
});

Handlebars.registerHelper("ifEquals", function(conditional, options) {
	if (options.hash.desired === options.hash.data) {
		return options.fn(this);
	} else {
		return options.inverse(this);
	}
});

var Easel = function() {
};

Easel.Dashboard = Backbone.NestedModel.extend({
	initialize: function() {
		this.modules = {};
		this.socket = io.connect('http://' + SOCKET_IP);

		this.on("refresh", this.refresh, this);
		this.on("add:module", this.onAddModule, this);

		var T = this;
		this.socket.on('broadcast:state', function(data) {
			T.onBroadcastState(data);
		});

		this.socket.on("error", function(err) {
			T.trigger("error", err);
		});
	},

	getStates: function() {
		this.socket.emit("get:state");
	},

	onBroadcastState: function(message) {
		var module = this.modules[message.from];

		if (!module) {
			module = new Easel.ModuleModel(message.body);
			module.socket = this.socket;
			this.trigger("add:module", module);
		}
			
		module.set(message.body);
	},

	refresh: function() {
		this.getStates();
	},

	onAddModule: function(module) {
		this.modules[module.get("name")] = module;
	}


});

Easel.ModuleModel = Backbone.NestedModel.extend({
	initialize: function() {
	},

	setState: function(stateData) {
		var stateMessage = {
			"from": "www-client",
			"to": this.get("name"),
			"body": stateData
		};
		this.socket.emit("set:state", stateMessage);
	}
});

Easel.ModuleView = Backbone.View.extend({
	tagName: "div",
	className: "module",
	initialize: function() {
		this.template = Handlebars.compile($("#template-" + this.model.get("type")).html());
		this.registerHandlers();
	},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
	
		var model = this.model;
		var T = this;

		return this.el;
	}
});

Easel.AlarmClockModuleView = Easel.ModuleView.extend({
	events: {
		"click #armed": "toggleArmed",
		"change #hour": "setHour",
		"change #minute": "setMinute"
	},

	registerHandlers: function() {
		this.model.bind("change:armed", this.armedChanged, this);
		this.model.bind("change:alarmTime.hour", this.hourChanged, this);
		this.model.bind("change:alarmTime.minute", this.minuteChanged, this);
	},

	toggleArmed: function() {
		var newArmed = !this.model.get("armed");
		this.model.setState({
			"armed": newArmed
		});
	},

	setHour: function() {
		var newHour = parseInt(this.$el.find("#hour").val());
		this.model.setState({
			"alarmTime": {
				"hour": newHour
			}
		});
	},

	setMinute: function() {
		var newMinute = parseInt(this.$el.find("#minute").val());
		this.model.setState({
			"alarmTime": {
				"minute": newMinute
			}
		});
	},

	armedChanged: function(model, newArmed) {
		if (newArmed) {
			this.$el.find("#armed").removeClass("btn-danger").addClass("btn-success");
		} else {
			this.$el.find("#armed").removeClass("btn-success").addClass("btn-danger");
		}
	},

	hourChanged: function(model, newHour) {
		this.$el.find("#hour").val(newHour);
	},

	minuteChanged: function(model, newMinute) {
		this.$el.find("#minute").val(newMinute);
	}

});

Easel.LedStripModuleView = Easel.ModuleView.extend({
	events: {
		"click #power": "togglePower",
		"click #animation-pulse": "pulseAnimationClicked",
		"click #animation-rainbow": "rainbowAnimationClicked",
		"click #animation-sunrise": "sunriseAnimationClicked"
	},

	registerHandlers: function() {
		this.model.bind("change:power", this.powerChanged, this);
		this.model.bind("change:color.h", this.hueChanged, this);
		this.model.bind("change:color.s", this.saturationChanged, this);
		this.model.bind("change:color.v", this.valueChanged, this);
		this.model.bind("change:color", this.colorChanged, this);
		this.model.bind("change:animation", this.animationChanged, this);
	},

	registerEvents: function() {
		var T = this;
		this.$el.find("#h").css("width","100%").slider().on("slide", function(){
			T.setHue.call(T, $(this).data("slider").getValue());
		});
		this.$el.find("#s").css("width","100%").slider().on("slide", function(){
			T.setSaturation.call(T, $(this).data("slider").getValue());
		});
		this.$el.find("#v").css("width","100%").slider().on("slide", function(){
			T.setValue.call(T, $(this).data("slider").getValue());
		});
	},

	togglePower: function() {
		var newPower = !this.model.get("power");
		this.model.socket.emit("set:state", {
			"to": this.model.get("name"),
			"body": {
				"power": newPower
			}
		});
	},

	pulseAnimationClicked: function() {
		if (this.model.get("animation.name") == "pulse") {
			this.model.setState({
				"animation": null
			});
		} else {
			this.model.setState({
				"animation": {
					"name": "pulse",
					"duration": 3000,
					"options": {
						"loop": true
					}
				}
			});
		}
	},

	rainbowAnimationClicked: function() {
		if (this.model.get("animation.name") == "rainbow") {
			this.model.setState({
				"animation": null
			});
		} else {
			this.model.setState({
				"animation": {
					"name": "rainbow",
					"duration": 3000,
					"options": {
						"loop": true
					}
				}
			});
		}
	},

	sunriseAnimationClicked: function() {
		if (this.model.get("animation.name") == "sunrise") {
			this.model.setState({
				"animation": null
			});
		} else {
			this.model.setState({
				"animation": {
					"name": "sunrise",
					"duration": 60000,
					"options": {
						"hold": true
					}
				}
			});
		}
	},

	powerChanged: function(model, newPower) {
		if (newPower) {
			this.$el.find("#power").removeClass("btn-danger").addClass("btn-success");
		} else {
			this.$el.find("#power").removeClass("btn-success").addClass("btn-danger");
		}
	},

	colorChanged: function(model, newColor) {
		var rgbCSS = "rgb("+Math.round(newColor.r)+","+Math.round(newColor.g)+","+Math.round(newColor.b)+")";
		this.$el.find("#color").css("background", rgbCSS);
	},

	hueChanged: function(model, newHue) {
		this.$el.find("#h").data("slider").setValue(newHue);
	},

	saturationChanged: function(model, newSaturation) {
		this.$el.find("#s").data("slider").setValue(Math.round(newSaturation * 100));
	},

	valueChanged: function(model, newValue) {
		this.$el.find("#v").data("slider").setValue(Math.round(newValue * 100));
	},

	animationChanged: function(model, newAnimation) {
		if (newAnimation && newAnimation.name == "pulse") {
			this.$el.find("#animation-pulse").addClass("btn-success");
		} else {
			this.$el.find("#animation-pulse").removeClass("btn-success");
		}

		if (newAnimation && newAnimation.name == "rainbow") {
			this.$el.find("#animation-rainbow").addClass("btn-success");
		} else {
			this.$el.find("#animation-rainbow").removeClass("btn-success");
		}

		if (newAnimation && newAnimation.name == "sunrise") {
			this.$el.find("#animation-sunrise").addClass("btn-success");
		} else {
			this.$el.find("#animation-sunrise").removeClass("btn-success");
		}
	},

	setHue: function(newHue) {
		this.model.socket.emit("set:state", {
			"to": this.model.get("name"),
			"body": {
				"color": {
					"h": newHue
				}
			}
		});
	},

	setSaturation: function(newSaturation) {
		this.model.socket.emit("set:state", {
			"to": this.model.get("name"),
			"body": {
				"color": {
					"s": newSaturation / 100.0
				}
			}
		});
	},

	setValue: function(newValue) {
		this.model.socket.emit("set:state", {
			"to": this.model.get("name"),
			"body": {
				"color": {
					"v": newValue / 100.0
				}
			}
		});
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
	
		var model = this.model;
		var T = this;

		this.colorChanged(this, this.model.get("color"));
		this.registerEvents();
		return this.el;
	}
});

Easel.DashboardView = Backbone.View.extend({
	initialize: function() {
		this.model.on("add:module", this.onAddModule, this);
		this.model.on("error", this.onError, this);
	},

	onAddModule: function(module) {
		var newModuleView = null;
		if (module.get("type") == "led_strip") {
			newModuleView = new Easel.LedStripModuleView({
				model: module
			});
		} else if (module.get("type") == "alarm_clock") {
			newModuleView = new Easel.AlarmClockModuleView({
				model: module
			});
		}
		if (newModuleView !== null) {
			this.$el.append(newModuleView.render());
		}
	},

	onError: function(err) {
		console.log("socket error");
	}
});



$(function() {
	var Dashboard = new Easel.Dashboard();
	var DashboardView = new Easel.DashboardView({
		model: Dashboard,
		el: $("#dashboard")
	});

	$("#refresh-button").click(function() {
		Dashboard.trigger("refresh");
	});

	Dashboard.trigger("refresh");
});
