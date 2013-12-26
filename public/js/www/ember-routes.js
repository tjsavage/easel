Easel.DashboardRoute = Ember.Route.extend({
	model: function() {
		return this.store.find('module');
	}
});