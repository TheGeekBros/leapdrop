// ??
console.log('Test');

var socket = io('http://localhost:8765');
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

	chrome.tabs.create({
		url: url,
		active: true
	}, function (tab) {
		qrTab = tab;
		console.log(qrTab);
		var id = qrTab.id;
		chrome.tabs.onRemoved.addListener(function (id, removeInfo) {
			if (removeInfo.isWindowClosing) {
				return;
			}

			chrome.tabs.update(activeTab.id, {active: true}, function (activeTabParam) {
				return;
			});
		});
	});
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
	});
});

socket.on('getURL', function (data) {
	chrome.tabs.getSelected(null, function (tab) {
		var url = tab.url;
		socket.emit('gotURL', {
			data: url
		});
	});
});