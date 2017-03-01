/**
 * Main application file
 */

'use strict';

var BASE_DIR = process.cwd();
console.log(BASE_DIR);

var express = require('express');
var path = require('path');
// Setup server
var app = express();
app.use(express.static(path.join(BASE_DIR, 'src')));
app.use(express.static(path.join(BASE_DIR, '.tmp')));
app.get('*', function (req, res) {
	return res.sendFile(path.join(BASE_DIR, 'src', 'index.html'));
});
var server = require('http').createServer(app);
server.listen(5555, function () {
	console.log('Express server listening on at port 5555');
});

// Expose app
exports = module.exports = app;