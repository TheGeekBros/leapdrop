module.exports = {
	openQRTab: function (socket, IP, PORT) {
		var id = socket.id;
		id = id.replace('/#', '');
		var url = 'http://' + IP + ':' + PORT + '/qr/' + id;

		socket.emit('openTab', {url: url});
	},

	openQRTabInAll: function (connections, IP, PORT) {
		console.log('Opening QRTab in ' + connections.length + ' computers..');
		for (var i = 0; i < connections.length; i++) {
			this.openQRTab(connections[i], IP, PORT);
		}
	},

	closeQRTabInAll: function (connections, IP, PORT) {
		for (var i = 0; i < connections.length; i++) {
			var socket = connections[i];
			socket.emit('closeQRTab', {});
		}
	},

	findSocket: function (connections, id) {
		console.log('Searching for socket with id ' + id);
		for (var i = 0; i < connections.length; i++) {
			var socket = connections[i];
			console.log('Comparing ' + id + ' with ' + socket.id);
			if (socket.id == id) return socket;
		}
		return null;
	},

	popSocket: function (connections, id) {
		var index = -1;
		for (var i = 0; i < connections.length; i++) {
			if (connections[i].id == id) {
				index = i;
				break;
			}
		}
		if (index < 0) return connections;
		
		connections.splice(index);
		return connections;
	}

};