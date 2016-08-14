module.exports = {
	openQRTab: function (socket, IP, PORT) {
		var id = socket.id;
		id = id.replace('/#', '');
		var url = 'http://' + IP + ':' + PORT + '/qr/' + id;

		socket.emit('openTab', {url: url});
	},

	openQRTabInAll: function (connections, IP, PORT) {
		for (var i = 0; i < connections.length; i++) {
			openQRTab(connections[i], IP, PORT);
		}
	},

	closeQRTabInAll: function (connections, IP, PORT) {
		for (var i = 0; i < connections.length; i++) {
			var socket = connections[i];
			socket.emit('closeQRTab', {});
		}
	},

	test: function () {
		console.log('TEST');
	},

	findSocket: function (connections, id) {
		console.log('Searching for socket with id ' + id);
		for (var i = 0; i < connections.length; i++) {
			var socket = connections[i];
			if (socket.id == id) return socket;
		}
		return null;
	}

};