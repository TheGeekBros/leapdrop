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

io.on('connection', function (socket) {
	connections.push(socket); // Add connection
	console.log(socket.id + ' was connected!');

	setTimeout(function () {

		var id = socket.id;
		id = id.replace('/#', '');
		var url = 'http://' + _IP + ':' + _PORT + '/qr/' + id;

		socket.emit('openTab', {url: url});
	}, 3000);

	setTimeout(function() {
		console.log('Emitting takePicture..');
		socket.emit('takePicture', {});
	}, 5000);

	socket.on('disconnect', function () {
		console.log(socket.id + ' was disconnected!');
		connections.pop(socket); // Remove connection
	});
});

console.log('Server started..');