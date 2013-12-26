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
	},

	getStates: function() {
		this.socket.emit("get:state");
	},

	onBroadcastState: function(message) {
		console.log("looking for",message.from);
		console.log("in",this.modules);
		var module = this.modules[message.from];

		if (!module) {
			console.log("creating new module",message.body)
			module = new Easel.ModuleModel(message.body);
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
		console.log("changed ",this.get("name"));
	}
});

Easel.ModuleView = Backbone.View.extend({
	tagName: "div",
	className: "module",
	initialize: function() {
		console.log(this.model.get("type"));
		this.template = _.template($("#template-" + this.model.get("type")).html());
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this.el;
	}
});

Easel.DashboardView = Backbone.View.extend({
	initialize: function() {
		this.model.on("add:module", this.onAddModule, this);
	},

	onAddModule: function(module) {
		var newModuleView = new Easel.ModuleView({
			model: module
		});
		this.$el.append(newModuleView.render());
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
