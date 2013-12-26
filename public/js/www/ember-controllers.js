function AppCtrl($scope, socket) {
	socket.on('init', function(data) {
		//Copied this, not sure if it'll be useful
	});

	socket.on('broadcast:status', function(data) {
		console.log("data");
	});

	$scope.requestStatus = function() {
		socket.emit("request:status", {
			"from": "www-client"
		});
	};
}