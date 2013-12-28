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

Easel.Dashboard = Backbone.Model.extend({
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

Easel.ModuleModel = Backbone.Model.extend({
	initialize: function() {
		this.on("change", this.onChange, this);
	},

	onChange: function() {
	},

	setState: function() {
		var stateMessage = {
			"from": "www-client",
			"to": this.get("name"),
			"body": this.toJSON()
		};
		this.socket.emit("set:state", stateMessage);
		this.socket.emit("get:state");
	}
});

Easel.ModuleView = Backbone.View.extend({
	tagName: "div",
	className: "module",
	initialize: function() {
		this.template = Handlebars.compile($("#template-" + this.model.get("type")).html());
		this.model.on("change", this.render, this);
		this.model.socket.emit("get:state");
		this.selectedAnimation = null;
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		if (this.model.get("type") === "led_strip") {
			this.renderLedStrip();
		}
		if (typeof this.model.get("color").r != "undefined") {
			var rgbCSS = "rgb("+Math.round(this.model.get("color").r)+","+Math.round(this.model.get("color").g)+","+Math.round(this.model.get("color").b)+")";
			this.$el.find("#color").css("background", rgbCSS);
		}
		
		return this.el;
	},

	renderLedStrip: function() {
		var model = this.model;
		var T = this;
		var rgbChange = function() {
			T.model.set("color", {
				"h": hSlider.getValue(),
				"s": sSlider.getValue() / 100.0,
				"v": vSlider.getValue() / 100.0
			});
			T.model.setState();
		};
		var hSlider = this.$el.find("#h").slider();
		hSlider.on('slideStop', rgbChange);
		hSlider = hSlider.data("slider");
		var sSlider = this.$el.find("#s").slider();
		sSlider.on('slideStop', rgbChange);
		sSlider = sSlider.data('slider');
		var vSlider = this.$el.find("#v").slider();
		vSlider.on('slideStop', rgbChange);
		vSlider = vSlider.data('slider');

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
		})
	},

	events: {
		"click #power": "togglePower",
	},

	togglePower: function() {
		console.log("clicked power");
		this.model.set("power", !this.model.get("power"));
		this.model.setState();
	}
});

Easel.DashboardView = Backbone.View.extend({
	initialize: function() {
		this.model.on("add:module", this.onAddModule, this);
		this.model.on("error", this.onError, this);
	},

	onAddModule: function(module) {
		var newModuleView = new Easel.ModuleView({
			model: module
		});
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
