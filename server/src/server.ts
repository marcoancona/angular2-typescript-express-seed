import express = require('express');
import path = require('path');
var port: number = process.env.PORT || 3000;
var app = express();


var publicDir = path.join(__dirname, '../public/');

/* Static serving of client artifacts */
app.use('/app/',
	express.static(path.join(publicDir, 'app')));
app.use('/css/',
	express.static(path.join(publicDir, 'css')));
app.use('/libs/',
	express.static(path.join(publicDir, 'libs')));
app.use('/views/',
	express.static(path.join(publicDir, 'views')));

app.get('/', function(req, res) {
	res.sendFile(path.join(publicDir, 'index.html'));
});

var server = app.listen(port, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('This express app is listening on port:' + port);
});
