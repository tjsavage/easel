var socketio = require('socket.io');
var socketio_client = require('socket.io-client');

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var Skynet = function(config) {
    this.config = config;
    if (this.config.me.type === "client") {
        this.serverAddress = this.config.server.ip + ":" + this.config.server.port;
        this.socket = socketio_client.connect(this.serverAddress, options); 
        this.socket.emit("new connection", this.config.me);
    } else if (this.config.me.type === "server") {
        this.io = socketio.listen(config.me.port);
        this.io.sockets.on("connection", function(socket) {
            socket.on("new connection", function(machine) {
                socket.broadcast.emit("client connected", machine);
            });

            socket.on("event", function(data) {
                socket.broadcast.emit('event', data);
            });
        });
    }
};

Skynet.prototype.emit = function(event, data) {
    this.socket.emit(event, data);
};

Skynet.prototype.on = function(type, handler) {
    this.socket.on(type, handler);
};

Skynet.prototype.disconnect = function() {
    this.socket.disconnect();
};

module.exports = Skynet;

