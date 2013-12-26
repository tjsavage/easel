var Easel = function() {
};

Easel.Dashboard = Backbone.Model.extend({
	initialize: function() {
		this.modules = {};
		this.socket = io.connect('http://127.0.0.1');

		this.on("refresh", this.refresh, this);

		var T = this;
		this.socket.on('broadcast:state', function(data) {
			T.onBroadcastState(data);
		});
	},

	getStates: function() {
		this.socket.emit("get:state");
	},

	onBroadcastState: function(message) {
		var module = this.modules[message.from];

		if (!module) {
			module = new Easel.ModuleModel(message.from);
			this.modules[message.from] = module;
		}
			
		module.set(message.body);
	},

	refresh: function() {
		console.log("dashboard refresh triggered");
		this.getStates();
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
		console.log(this.model.type);
	}
});



$(function() {
	var Dashboard = new Easel.Dashboard();

	$("#refresh-button").click(function() {
		console.log("refresh clicked");
		Dashboard.trigger("refresh");
	})
});
