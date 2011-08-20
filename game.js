var c = document.getElementById("theCanvas")
var cx = c.getContext("2d");

var left = 1;
var right = 2;
var up = 4;
var down = 8;

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
	}
	console.log(matrix[matrix.length -1 ]);
    }
    alert(matrix);
}

function animate() {

}


init();
