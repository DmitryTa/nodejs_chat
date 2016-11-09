var clients = [];
function getOnline() {
	return clients.length;
}
exports.subscribe = function(req, res) {
	console.log('subscribe');
	res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
	clients.push(res);
	res.on('close' ,function() {
		clients.splice(clients.indexOf(res), 1);
	})
};

exports.publish = function(message) {
	console.log("send to client");
	clients.forEach(function(res) {
		res.end(message);
	});

	clients = [];
}
exports.online = function(req, res) {
	var onlineC = getOnline()
	res.end(onlineC.toString());
}
setInterval(function() {
	exports.usersOnline = clients.length;
	
}, 10000);