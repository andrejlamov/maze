var c = document.getElementById("theCanvas")
var cx = c.getContext("2d");

var left = 1;
var right = 2;
var up = 4;
var down = 8;

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
    var neighbours = [];
    
    if(x > 1 && matrix[x-1][y] == inaccess) {
	neighbours.push(matrix[x-1][y]);
	matrix[x][y-1] = inaccess & ~right;
	matrix[x][y] = inaccess & ~left;
    }
    
    console.log(neighbours);
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
