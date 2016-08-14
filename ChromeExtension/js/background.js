// var _IP = '172.23.0.245';
// var _IP = '192.168.43.156';
// var _IP = '192.168.49.1';
var _IP = '128.199.69.60';
var _PORT = '8765';

var socket = io('http://' + _IP + ':' + _PORT);

var opened = false;

console.log('Emitting "client"..');
socket.emit('client', {});

var qrTab = null;
var activeTab = null;

socket.on('openTab', function (data) {
	var url = data.url;
	console.log(url);

	chrome.tabs.getSelected(null, function (tab) {
		activeTab = tab;
		console.log('activeTab');
		console.log(activeTab);
	});

	if (!opened) {
		chrome.tabs.create({
			url: url,
			active: true
		}, function (tab) {
			qrTab = tab;
			console.log(qrTab);
			opened = true;
			var id = qrTab.id;
			chrome.tabs.onRemoved.addListener(function (id, removeInfo) {

				opened = false;

				if (removeInfo.isWindowClosing) {
					return;
				}

				chrome.tabs.update(activeTab.id, {active: true}, function (activeTabParam) {
					return;
				});
			});
		});
	} 

});

socket.on('closeQRTab', function () {
	var id = qrTab.id;
	chrome.tabs.remove(id, function () {
		return;
	});
});

socket.on('openURL', function (data) {
	var url = data.url;
	chrome.tabs.create({
		url: url,
		active: true
	}, function (tab) {
		console.log('Opened ' + url);
		var id = tab.id;
		console.log('ID of opened tab: ' + id);
	});
});

socket.on('getURL', function (data) {
	// chrome.tabs.getSelected(null, function (tab) {
	// 	var url = tab.url;
	// 	console.log('Emitting "gotURL" with ' + url);
	// 	socket.emit('gotURL', {
	// 		data: url
	// 	});
	// });
	var url = activeTab.url;
	console.log(activeTab);
	console.log('Emitting "gotURL" with ' + url);
	socket.emit('gotURL', {
		url: url
	});
});