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
		this.socket = io.connect('http://127.0.0.1');

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

	setState: function() {
		var stateMessage = {
			"from": "www-client",
			"to": this.get("name"),
			"body": this.toJSON()
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
	}
});

Easel.LedStripModuleView = Easel.ModuleView.extend({
	events: {
		"click #power": "togglePower",
	},

	registerHandlers: function() {
		this.model.bind("change:power", this.powerChanged, this);
		this.model.bind("change:color.h", this.hueChanged, this);
		this.model.bind("change:color.s", this.saturationChanged, this);
		this.model.bind("change:color.v", this.valueChanged, this);
		this.model.bind("change:color", this.colorChanged, this);
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
		console.log("emitting state");
		this.model.socket.emit("set:state", {
			"to": this.model.get("name"),
			"body": {
				"power": newPower
			}
		});
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
		/*
		this.$el.find("#animation-pulse").click(function() {
			console.log('clicked pulse');
			var currentAnimation = T.model.get("animation");
			if (!currentAnimation || currentAnimation.name != "pulse") {
				T.model.set("animation", {
					"name": "pulse",
					"duration": 3000,
					"options": {
						"loop": true
					}
				});
			} else if (currentAnimation.name == "pulse") {
				T.model.set("animation", null);
			}
			T.model.setState();
		});
		*/
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
		var newModuleView;
		if (module.get("type") == "led_strip") {
			newModuleView = new Easel.LedStripModuleView({
				model: module
			});
		}
		this.$el.append(newModuleView.render());
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
	})

	Dashboard.trigger("refresh");
});
