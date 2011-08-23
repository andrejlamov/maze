var c = document.getElementById("theCanvas")
var cx = c.getContext("2d");

var left = 1;
var right = 2;
var up = 4;
var down = 8;
var visited = 16;

var inaccess = left | right | up | down;

var w = c.width;
var h = c.height;

var rows = 10;
var cols = 10;

var matrix = [];

function init() {
    for(var r = 0; r < rows ; r++) {
	matrix.push([]);
	for(var c = 0; c < cols; c++) {
	    var cell = up | down | left | right;
	    /*
	    if (r == 0)
		cell = cell | up;
	    if (r == rows - 1)
		cell = cell | down;
	    if (c == 0)
		cell = cell | left;
	    if (c == cols - 1)
		cell = cell | right;
	    */

	    matrix[r].push(cell);
	}
    }
    makePath(5,5);
    
    for(var x = 0; x < matrix.length; x++) {
	for(var y = 0; y < matrix[x].length; y++) {
	    drawCell(y, x, matrix[x][y]);
	}
	console.log(matrix[x]);
    }
}

function makePath(x,y) {
    matrix[x][y] |= visited;

    var upf = function() {  if(x > 0) {
	if((matrix[x-1][y] & visited) == 0) {
	    matrix[x][y] &= ~up;
	    matrix[x-1][y] &= ~down;
	    makePath(x-1, y)
	}
	}}

    var downf = function() {  if(x < rows-1) {
	if((matrix[x+1][y] & visited) == 0) {
	    console.log("up");
	    matrix[x][y] &= ~down;
	    matrix[x+1][y] &= ~up;
	    makePath(x+1, y)
	}
	}}

    var rightf= function() {if(y < cols-1) {
	if((matrix[x][y+1] & visited) == 0) {
	    console.log("right");
	    matrix[x][y] &= ~right;
	    matrix[x][y+1] &= ~left;
	    makePath(x, y+1);
	}
	}}
    var leftf= function() {if(y > 0) {
	if((matrix[x][y-1] & visited) == 0) {
	    console.log("right");
	    matrix[x][y] &= ~left;
	    matrix[x][y-1] &= ~right;
	    makePath(x, y-1);
	}
	}}
    
    var dirs = [upf, rightf, downf, leftf];
    dirs.sort(function() { return Math.round(Math.random()) - 0.5 });
    for(var i = 0; i < dirs.length; i++) {
	if(dirs[i]())
	    return true;
    }
    return true;
}


function drawCell(x, y, status) {
    var part = h / rows;
    function maybeDraw(x, y, maybe) {
	maybe ? cx.lineTo(x, y) : cx.moveTo(x, y);
    }
    cx.beginPath();
    maybeDraw(x * part, y * part, false);
    maybeDraw(x * part + part, y * part, status & up);
    maybeDraw(x * part + part, y * part + part, status & right);
    maybeDraw(x * part, y * part + part, status & down);
    maybeDraw(x * part, y * part, status & left);
    cx.stroke();
}

function animate() {

}


init();
