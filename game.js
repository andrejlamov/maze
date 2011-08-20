var c = document.getElementById("theCanvas")
var cx = c.getContext("2d");

var left = 1;
var right = 2;
var up = 4;
var down = 8;

var w = c.width;
var h = c.height;

function init() {
    var rows = 10;
    var cols = 10;
    var matrix = [];
    
    for(var r = 0; r < rows ; r++) {
	matrix.push([]);
	for(var c = 0; c < cols; c++) {
	    var cell = 0;
	    if (r == 0)
		cell = cell | down;
	    if (r == rows - 1)
		cell = cell | up;
	    if (c == 0)
		cell = cell | left;
	    if (c == cols - 1)
		cell = cell | right;

	    matrix[r].push(cell);

	    cx.fillStyle = (c+r) % 2 == 0 ? "blue" : "red";
	    var part = w / 10;
	    cx.fillRect(r * part, c * part,
			r * part + part, c * part + part);
	}
	console.log(matrix[matrix.length -1 ]);
    }
}

function animate() {

}


init();
