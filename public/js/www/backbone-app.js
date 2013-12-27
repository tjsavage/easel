_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

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
		console.log("got state",message);
		var module = this.modules[message.from];

		if (!module) {
			console.log("creating new module",message.body)
			module = new Easel.ModuleModel(message.body);
			module.socket = this.socket;
			this.trigger("add:module", module);
		}
			
		module.set(message.body);
	},

	refresh: function() {
		console.log("dashboard refresh triggered");
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
		console.log("changed ",this.get("name"),this.toJSON());
	},

	setState: function() {
		var stateMessage = {
			"from": "www-client",
			"to": this.get("name"),
			"body": this.toJSON()
		};
		console.log("sending set:state",stateMessage);
		this.socket.emit("set:state", stateMessage);
	}
});

Easel.ModuleView = Backbone.View.extend({
	tagName: "div",
	className: "module",
	initialize: function() {
		console.log(this.model.get("type"));
		this.template = Handlebars.compile($("#template-" + this.model.get("type")).html());
		this.model.on("change", this.render, this);
	},

	render: function() {
		console.log("rendering template with",this.model.toJSON());
		this.$el.html(this.template(this.model.toJSON()));
		if (this.model.get("type") === "led_strip") {
			this.renderLedStrip();
		}
		return this.el;
	},

	renderLedStrip: function() {
		var model = this.model;
		var T = this;
		var rgbChange = function() {
			T.model.set("color", {
				"r": rSlider.getValue(),
				"g": gSlider.getValue(),
				"b": bSlider.getValue()
			});
			T.model.setState();
		};
		var rSlider = this.$el.find("#r").slider();
		rSlider.on('slideStop', rgbChange);
		rSlider = rSlider.data("slider");
		var gSlider = this.$el.find("#g").slider();
		gSlider.on('slideStop', rgbChange);
		gSlider = gSlider.data('slider');
		var bSlider = this.$el.find("#b").slider();
		bSlider.on('slideStop', rgbChange);
		bSlider = bSlider.data('slider');
	},

	events: {
		"click #power": "togglePower"
	},

	togglePower: function() {
		console.log("toggling power, was",this.model.get("power"));
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
		console.log("refresh clicked");
		Dashboard.trigger("refresh");
	})
});
