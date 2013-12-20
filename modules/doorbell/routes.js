var exec = require('child_process').exec;
var sys = require('sys');

var TWILIO_ACCOUNT_SID = "AC4cffdadfc3c27989f8371c82970b07d1";
var TWILIO_AUTH_TOKEN = "88fc628c1b03dc409f7c7515097f51c4";
var twilio_api = require('twilio');

var LOCKED = true;

var DOORBELL_FILE = __dirname + '/misc/doorbell-2.wav';
var twilio_client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.get_twilio = function(req, res) {
	var callSid = req.query.CallSid;

	var resp = new twilio_api.TwimlResponse();
	resp.play({"digits": "1"});

	resp.dial({"timeout": 30}, function() {
		this.number("+1-310-266-3121");
		this.number("+1-973-216-8106");
	});

	ringLocally();	
	res.send(resp.toString());
};

exports.get_lock = function(req, res) {
	res.send(200, {status: LOCKED});
};

exports.post_lock = function(req, res) {
	var postData = '';

	if (req.body.status === 0 || req.body.status === "false" || req.body.status === false || req.body.status === '0') {
		LOCKED = false;
	} else {
		LOCKED = true;
	}

	//fill this in with db stuff
};



function puts(error, stdout, stderr) {
    sys.puts(stdout);
}

function playDoorbell() {
    console.log("playing doorbell file " + DOORBELL_FILE);
    exec("echo " + DOORBELL_FILE, puts);
    exec("aplay " + DOORBELL_FILE, puts);
}


function ringLocally() {
    console.log("ringing...");
    playDoorbell();
}