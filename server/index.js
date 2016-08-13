var _PORT = 8765;

var app = require('http').createServer(handler);
var io = require('socket.io')(app);

function handler (req, res) {
	res.end('Yo');
}

app.listen(_PORT);

var connections = [];

io.on('connection', function (socket) {
	connections.push(socket);
	console.log('A user was connected!');
});

console.log('Server started..');