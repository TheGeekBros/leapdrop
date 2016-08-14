var helper = require('./helper.js');

var _PORT = 8765;
var _IP = 'localhost';

var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var urlRegex = /^\/qr\/[.]*/i;

function handler (req, res) {

	// For static files
	if (req.url == '/js/jquery.min.js') {
		console.log('test')
		fs.readFile(__dirname + '/html/js/jquery.min.js', function (err, data) {
			if (!err) {
				res.writeHead(299);
				res.end(data);
			} else {
				console.log(err);
			}
		});
	} else if (req.url == '/js/qrcode.min.js') {
		fs.readFile(__dirname + '/html/js/qrcode.min.js', function (err, data) {
			if (!err) {
				res.writeHead(299);
				res.end(data);
			}
		});
	}
	// QR Code URL
	else if (urlRegex.test(req.url)) {
		var id = req.url;
		id = id.replace('/qr/', '');
		id = id.replace('/', '');
		res.setHeader('Content-Type', 'text/html');
		res.write('<!DOCTYPE html><html><head><title></title><style type="text/css">html, body {height: 100%;width: 100%;}body {display: flex;justify-content: center;flex-direction: column;align-content: center;}</style></head><body><div id="qrcode" style="margin: 0 auto"></div><script src="/js/jquery.min.js"></script><script src="/js/qrcode.min.js"></script><script type="text/javascript">var qrcode = new QRCode("qrcode", {    text: "' + id + '",    width: 500,    height: 500,    colorDark : "#000000",    colorLight : "#ffffff",    correctLevel : QRCode.CorrectLevel.H});</script></body></html>');
		res.end();
	}
	// Everything else
	else {
		res.end('yo');
	}

}

app.listen(_PORT);

var connections = [];
var cameraSocket = undefined;
var leapcontroller = undefined;
var grabbing = false;
var sourceSocket;
var destinationSocket;
var sourceURL = '';
var destinationURL = '';

io.on('connection', function (socket) {

	socket.on('disconnect', function () {
		console.log(socket.id + ' was disconnected!');
		if (connections.indexOf(socket)) {
			connections.pop(socket);
		}
	});

	socket.on('iAmCamera', function () {
		console.log(socket.id + ' was connected! [CAMERA]');
		cameraSocket = socket;
		connections.pop(cameraSocket);
	});

	socket.on('leapcontroller', function () {
		console.log(socket.id + ' was connected! [LEAPCONTROLLER]');
		leapcontroller = socket;
		connections.pop(leapcontroller);
	});

	socket.on('client', function () {
		connections.push(socket);
		console.log(socket.id + ' was connected! [CLIENT]');
	});

	socket.on('grab', function () {
		if (cameraSocket && !grabbing) {

			setTimeout(function() {
				cameraSocket.emit('source', {});
			}, 300);

			helper.openQRTabInAll(connections, _IP, _PORT);

			grabbing = true;
		} else {
			console.log('Received "grab", but cameraSocket uninitialized.');
		}
	});

	socket.on('ungrab', function () {
		if (cameraSocket && grabbing) {
			cameraSocket.emit('destination', {});
			grabbing = false;
		} else {
			console.log('Received "ungrab", but cameraSocket uninitialized.');
		}
	});

	socket.on('grabResponse', function (data) {
		console.log(data);
		return;
		var id = data.id;
		id = '/#' + id;
		var _socket = helper.findSocket(connections, id);
		if (!_socket) {
			console.log('grabResponse: found socket is null');
			return;
		}
		sourceSocket = _socket;
		sourceSocket.emit('getURL', function () {
			console.log('Emitting "getUrl"');
		});
	});

	socket.on('gotURL', function (data) {
		sourceURL = data.url;
	});

	socket.on('ungrabResponse', function (data) {
		var id = data.id;
		id = '/#' + id;
		var _socket = helper.findSocket(connections, id);
		if (!_socket) {
			console.log('ungrabResponse: found socket is null');
			return;
		}
		destinationSocket = _socket;
		helper.closeQRTabInAll(connections, _IP, _PORT);

		destinationSocket.emit('openURL', {
			url: sourceURL
		});
	});
});

console.log('Server started..');