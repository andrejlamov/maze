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
var hpx = h / rows / 2;

var dx = 0;
var dy = 0;

var matrix = [];



function init() {
    for(var x = 0; x < cols; x++) {
	matrix.push([]);
	for(var y = 0; y < rows; y++) {
	    var cell = up | down | left | right;
	    matrix[x].push(cell);
	}
    }
    document.onkeydown = keydownhandler;
    makePath(0,0);
    repaint();
}

function repaint() {
    cx.clearRect(0,0,w, h);

    cx.save();
    cx.translate(w / 2, hpx / 2);
    drawMaze();
    drawDude();
    cx.restore();
}

function keydownhandler(e) {
    var char = String.fromCharCode(e.which);
    var direction = 0;
    if (char == "W" && !(matrix[dx][dy] & up)) {
	dy--;
    } else if (char == "A" && !(matrix[dx][dy] & left)) {
	dx--;
    } else if (char == "S" && !(matrix[dx][dy] & down)) {
	dy++;
    } else if (char == "D" && !(matrix[dx][dy] & right)) {
	dx++;
    }
    repaint();
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
  
    var dirs = [upf, downf, rightf, leftf];
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
    cx.save();
    cx.translate(x * wpx / 2 - y * wpx / 2, x * hpx / 2 + y * hpx / 2);
    cx.beginPath();
    maybeDraw(0, -hpx/2, false);
    maybeDraw(wpx/2, 0, status & up);
    maybeDraw(0, hpx/2, status & right);
    maybeDraw(-wpx/2, 0, status & down);
    maybeDraw(0, -hpx/2, status & left);
    cx.stroke();
    cx.restore();
}

function drawDude() {
    cx.fillStyle = "rgb(200,0,0)";
    cx.save();
    cx.translate(dx * wpx / 2 - dy * wpx / 2, dx * hpx / 2 + dy * hpx / 2);
    cx.fillRect(-wpx/4, -hpx, 2 * wpx/4,  hpx);
    cx.restore();
}

init();
