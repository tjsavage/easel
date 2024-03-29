var control = require('control'),
	task = control.task;

function configure(hostname, address, sshPort) {
	var controller = Object.create(control.controller);

	controller.user = 'pi';
	controller.sshOptions = ['-p ' + sshPort];
	controller.scpOptions = ['-P ' + sshPort, '-r'];
	controller.address = address;
	controller.localDir = "./" + hostname;
	controller.remoteDir = "/home/pi/easel";
	controller.hostname = hostname;

	return [controller];
}

task('vincent', 'Config for vincent', function() {
	return configure('vincent', 'taylorsavage.com', '2219');
});

task('pablo', 'Config for pablo', function() {
	return configure('pablo', 'taylorsavage.com', '2221');
});

task('pablo-eth', 'Config for pablo over ethernet', function() {
	return configure('pablo', 'taylorsavage.com', '2220');
});

task('deploy', 'Deploy a machine', function(controller) {
	controller.ssh("cd /home/pi/easel && git pull origin master", function() {
		controller.ssh("cd " + controller.remoteDir + " && npm install", function() {
			controller.ssh("cd " + controller.remoteDir + " && cp -f config-" + controller.hostname + ".js config.js && echo 'copied config'", function() {
				controller.ssh("/etc/init.d/nodejs.sh restart");
			});
		});
	});
});

control.begin();