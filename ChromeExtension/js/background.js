// ??
console.log('Test');

var socket = io('http://localhost:8765');

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