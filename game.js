var c = document.getElementById("theCanvas");
var cx = c.getContext("2d");

var left    = 1;
var right   = 2;
var up      = 4;
var down    = 8;
var visited = 16;

var w = c.width;
var h = c.height;

var rows = 20;
var cols = 20;

var wpx = w / cols;
var hpx = h / rows;

var matrix = [];

function init() {
    for(var x = 0; x < cols; x++) {
	matrix.push([]);
	for(var y = 0; y < rows; y++) {
	    var cell = up | down | left | right;
	    matrix[x].push(cell);
	}
    }
    makePath(0,0);
    drawMaze();
}

function makePath(x,y) {
    matrix[x][y] |= visited;

    var upf = function() {
	if(y > 0 && (matrix[x][y-1] & visited) == 0) {
	    matrix[x][y] &= ~up;
	    matrix[x][y-1] &= ~down;
	    makePath(x, y-1)
	}
    }
    var downf = function() {
	if(y < rows-1 && (matrix[x][y+1] & visited) == 0) {
	    matrix[x][y] &= ~down;
	    matrix[x][y+1] &= ~up;
	    makePath(x, y+1)
	}
    }
    var rightf= function() {
	if(x < cols-1 && (matrix[x+1][y] & visited) == 0) {
	    matrix[x][y] &= ~right;
	    matrix[x+1][y] &= ~left;
	    makePath(x+1, y);
	}
    }
    var leftf= function() {
	if(x > 0 && (matrix[x-1][y] & visited) == 0) {
	    matrix[x][y] &= ~left;
	    matrix[x-1][y] &= ~right;
	    makePath(x-1, y);
	}
    }
  
    var dirs = [upf, rightf, downf, leftf];
    dirs.sort(function() { return Math.round(Math.random()) - 0.5 });
    for(var i = 0; i < dirs.length; i++) {
	dirs[i]()
    }
}


function drawMaze() {
    for(var x = 0; x < cols; x++) {
	for(var y = 0; y < rows; y++) {
	    drawCell(x, y, matrix[x][y]);
	}
    }
}

function drawCell(x, y, status) {
    function maybeDraw(x, y, maybe) {
	maybe ? cx.lineTo(x, y) : cx.moveTo(x, y);
    }
    cx.beginPath();
    maybeDraw(x * wpx, y * hpx, false);
    maybeDraw(x * wpx + wpx, y * hpx, status & up);
    maybeDraw(x * wpx + wpx, y * hpx + hpx, status & right);
    maybeDraw(x * wpx, y * hpx + hpx, status & down);
    maybeDraw(x * wpx, y * hpx, status & left);
    cx.stroke();
}

init();
