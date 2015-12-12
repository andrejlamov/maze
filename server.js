var nodestatic = require('node-static');
var http = require('http');
var io = require('socket.io');

var file = new nodestatic.Server();

var server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
});

server.listen(8080);

var socket = io.listen(server);

socket.on('connection', function(socket){
    console.log('a user connected');
});
