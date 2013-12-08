var control = require('control'),
	task = control.task;

function configure(hostname, address, sshPort) {
	var controller = Object.create(control.controller);

	controller.user = 'pi';
	controller.sshOptions = ['-p ' + sshPort];
	controller.scpOptions = ['-P ' + sshPort, '-r'];
	controller.address = address;
	controller.localDir = "./" + hostname;
	controller.remoteDir = "/home/pi/" + hostname;

	return [controller];
}

task('vincent', 'Config for vincent', function() {
	return configure('vincent', 'taylorsavage.com', '2219');
});

task('pablo', 'Config for pablo', function() {
	return configure('pablo', 'taylorsavage.com', '2221');
});

task('deploy', 'Deploy a machine', function(controller) {
	controller.ssh("rm -rf " + controller.remoteDir, function() {
		controller.scp(controller.localDir, controller.remoteDir, function() {
			controller.ssh("cd " + controller.remoteDir + " && npm install", function() {
				controller.ssh("/home/pi/nodejs.sh restart");
			});
		});
	});
});

control.begin();