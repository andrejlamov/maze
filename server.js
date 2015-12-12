var nodestatic = require('node-static');
var http = require('http');
var io = require('socket.io');
var randomcolor = require('just.randomcolor');

var file = new nodestatic.Server();

var server = http.createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
});

server.listen(8080);

var socketio = io.listen(server);


// MAZE

var left    = 1;
var right   = 2;
var up      = 4;
var down    = 8;
var visited = 16;

var rows = 20;
var cols = 20;
var matrix = [];

var dudes = {};

function initMatrix() {
    for(var x = 0; x < cols; x++) {
        matrix.push([]);
        for(var y = 0; y < rows; y++) {
            var cell = up | down | left | right;
            matrix[x].push(cell);
        }
    }
}

function makePath() {
    // Implements a randomized Prim's algorithm (from Wikipedia)
    // Start with a grid full of walls.

    var directionVectors = {};
    // Init direction vectors
    [[up,    [0, -1]],
     [right, [1,  0]],
     [down,  [0,  1]],
     [left,  [-1, 0]]
    ].forEach(function(kv) {
        directionVectors[kv[0]] = kv[1];
    });

    function maskOut(x, y, direction) {
        matrix[x][y] &= (up|right|down|left|visited) ^ direction;
    }

    // Pick a cell, mark it as part of the maze. Add the walls of the cell to the wall list.
    var frontier = [[0, 0, right], [0, 0, down]];

    // While there are walls in the list:
    while (frontier.length) {
        // Pick (and remove) a random wall from the list and a random direction.
        var current = frontier.splice(Math.floor(Math.random() * frontier.length), 1)[0];

        var x = current[0];
        var y = current[1];
        var direction = current[2];

        // Get the cell in that direction
        var dv = directionVectors[direction];
        var x_ = dv[0] + x;
        var y_ = dv[1] + y;

        // If the cell in that direction isn't in the maze yet (and is part of the maze):
        if (x_ >= 0 && x_ < rows && y_ >= 0 && y_ < cols
            && !(matrix[x_][y_] & visited)) {

            // Make the wall a passage and mark the cell on the opposite side as part of the maze.
            switch (direction) {
            case up:    maskOut(x, y, up);    maskOut(x_, y_, down);  break;
            case right: maskOut(x, y, right); maskOut(x_, y_, left);  break;
            case down:  maskOut(x, y, down);  maskOut(x_, y_, up);    break;
            case left:  maskOut(x, y, left);  maskOut(x_, y_, right); break;
            default: throw Exception('Bad spot');
            }

            // Add the neighboring walls of the cell to the wall list.
            frontier.push([x_, y_, up]);
            frontier.push([x_, y_, right]);
            frontier.push([x_, y_, down]);
            frontier.push([x_, y_, left]);

            // Mark both cells as visited
            matrix[x][y]   |= visited;
            matrix[x_][y_] |= visited;
        }
    }
}

initMatrix();
makePath();

function dict2values(dict) {
    var list = [];
    for(k in dict) {
        list.push(dict[k]);
    }
    return list;
}

socketio.on('connection', function(socket){
    var rgb = new randomcolor({a:[0.0]}).toRGB().toCSS();
    var me = {dx:0, dy:0, tx:0 , ty:0, color: rgb, id: socket.id};
    dudes[socket.id] = me;

    var world = {
        matrix: matrix,
        rows: rows,
        cols: cols,
        dudes: dict2values(dudes),
        myid: socket.id
    };

    socket.emit('world', world);
    socket.broadcast.emit('update', dict2values(dudes));

    socket.on('disconnect', function() {
        delete dudes[socket.id];
        socket.broadcast.emit('update', dict2values(dudes));
    });

    socket.on('dudes', function(d) {
        d.forEach(function(d){
            dudes[d.id] = d;
        });
        socket.broadcast.emit('update', d);
    });
});
