var TWILIO_ACCOUNT_SID = "AC4cffdadfc3c27989f8371c82970b07d1";
var TWILIO_AUTH_TOKEN = "88fc628c1b03dc409f7c7515097f51c4";
var twilio_api = require('twilio');

var sys = require('sys');
var exec = require('child_process').exec;

var DOORBELL_FILE = __dirname + '/misc/doorbell-2.wav';
var twilio_client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(__dirname + "/../../databases/vincent.db");

exports.twilio = function(req, res) {
	var callSid = req.query.CallSid;

	db.serialize(function() {
		var stmt = db.each("SELECT status as status from doorbell_lock", function(err, row) {
			var locked = true;
			if(!row.status) {
				locked = false;
			}

			var resp = new twilio_api.TwimlResponse();
			resp.play({"digits": "1"});
			if (!locked) {
				resp.play({"digits": "9"});
			} else {
				resp.dial({"timeout": 30}, function() {
					this.number("+1-310-266-3121");
					this.number("+1-973-216-8106");
				});
				if (callSid) {
					ringLocally(callSid);	
				}
			}

			res.send(resp.toString());
		});
	});
};

exports.get_lock = function(req, res) {
	db.serialize(function() {
		var stmt = db.each("SELECT status as status from doorbell_lock", function(err, row) {
			console.log(row.status);
			res.send(200, {status: Boolean(row.status)});
			return;
		});
	});
};

exports.post_lock = function(req, res) {
	var postData = '';
	console.log(req.body);

	var lockStatus;

	if (req.body.status === 0 || req.body.status === "false" || req.body.status === false || req.body.status === '0') {
		lockStatus = false;
	} else {
		lockStatus = true;
	}

	db.serialize(function() {
		db.run("UPDATE doorbell_lock SET status = " + (lockStatus ? 1 : 0));
		console.log("Updated lock status to: " + lockStatus);
		res.send(200, {status: lockStatus});
	});
	
	
};

function puts(error, stdout, stderr) {
	sys.puts(stdout);
};

function playDoorbell() {
	exec("echo " + DOORBELL_FILE, puts);
	exec("aplay " + DOORBELL_FILE, puts);
};


function ringLocally(callSid) {
	console.log("ringing...");
	playDoorbell();

	twilio_client.calls(callSid).get(function(err, responseData) {
		if (err) {
			console.log("error GETting twilio call data:");
			console.log(err);
			return;
		}
		if(responseData.status === 'queued' || responseData.status === 'ringing' || responseData.status === 'in-progress') {
			setTimeout(ringLocally, 1000);
		} else {
			console.log("call status: " + responseData.status);
		}
	});
}
