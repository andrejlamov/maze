var c = document.getElementById("theCanvas")
var cx = c.getContext("2d");

var left = 1;
var right = 2;
var up = 4;
var down = 8;

var w = c.width;
var h = c.height;

var rows = 10;
var cols = 10;


function init() {
    var matrix = [];
    
    for(var r = 0; r < rows ; r++) {
	matrix.push([]);
	for(var c = 0; c < cols; c++) {
	    var cell = 0;
	    if (r == 0)
		cell = cell | up;
	    if (r == rows - 1)
		cell = cell | down;
	    if (c == 0)
		cell = cell | left;
	    if (c == cols - 1)
		cell = cell | right;

	    matrix[r].push(cell);

	    drawCell(c, r, cell);
	}
    }
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
