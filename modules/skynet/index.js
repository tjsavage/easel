var socketio = require('socket.io');
var socketio_client = require('socket.io-client');

var options = {
    transports: ['websocket'],
    'force new connection': true
};

function Skynet(context, config) {
    this.context = context;
    this.config = config;
    this.onGetStateHandler = null;
    if (this.config.me.type === "client") {
        this.serverAddress = this.config.server.ip + ":" + this.config.server.port;
        this.socket = socketio_client.connect(this.serverAddress, options);
        this.emit("new:connection", this.config.me);
    } else if (this.config.me.type === "server") {
        this.io = socketio.listen(config.me.port);
        this.io.sockets.on("connection", function(socket) {
            socket.on("new:connection", function(machine) {
                socket.broadcast.emit("new:client", machine);
            });

            socket.on("message", function(data) {
                socket.broadcast.emit('message', data);
            });

            socket.on("get:state", function(data) {
                socket.broadcast.emit("get:state", data);
            });

            socket.on("set:state", function(data) {
                socket.broadcast.emit("set:state", data);
            });

            socket.on("broadcast:state", function(data) {
                socket.broadcast.emit("broadcast:state", data);
            });
        });
    }
};

Skynet.prototype.emit = function(event, data) {
    this.socket.emit(event, data);
};

Skynet.prototype.emitMessage = function(data) {
    this.emit("message", data);
};

Skynet.prototype.emitState = function(stateData) {
    this.emit("broadcast:state", {
        "from": this.config.me.name,
        "body": stateData
    });
};

Skynet.prototype.on = function(type, handler) {
    var T = this;
    this.socket.on(type, function(data) {
        handler.call(T.context, data);
    });
};

Skynet.prototype.onClientConnected = function(clientName, handler) {
    var T = this;

    this.on("new:client", function(machine) {
        if (machine.name === clientName) {
            handler.call(T.context);
        }
    });
};

Skynet.prototype.onMessage = function(handler) {
    this.on("message", handler);
};

Skynet.prototype.onMessageToMe = function(handler) {
    var myName = this.config.me.name;
    var T = this;
    this.on("message", function(data) {
        if (data.to === myName) {
            handler.call(T.context, data);
        }
    });
};

Skynet.prototype.onSetState = function(handler) {
    var T = this;

    this.on("set:state", function(stateDataMessage) {
        if (stateDataMessage.to === T.config.me.name) {
            handler.call(T.context, stateDataMessage.body);
        }
    });
};

Skynet.prototype.onGetState = function(handler) {
    var T = this;
    console.log("setting onGetStateHandler for",T.config.me.name,handler);
    this.onGetStateHandler = handler;
    this.on("get:state", function(data) {
        if (!T.onGetStateHandler) {
            console.log("ERROR! Didn't set the onGetState handler for",T.config.me.name);
            return;
        }
        var stateBody = T.onGetStateHandler.call(T.context);
        console.log("this.config",T.config);
        console.log("this.context.options",T.context.options);
        var state = {
            "from": T.config.me.name,
            "body": stateBody
        };
        T.emit("broadcast:state", state);
    });
};

Skynet.prototype.requestState = function(data) {
    this.emit("get:state", data);
};

Skynet.prototype.setState = function(name, stateData) {
    this.emit("set:state", {
        "to": name,
        "from": this.config.me.name,
        "body": stateData
    });
};

Skynet.prototype.onReceiveState = function(handler) {
    this.on("broadcast:state", handler);
};

Skynet.prototype.disconnect = function() {
    this.socket.disconnect();
};

module.exports = Skynet;

