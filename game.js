var c = document.getElementById("theCanvas")
var cx = c.getContext("2d");

function init() {
    var rows = 10;
    var cols = 10;
    var matrix = [];
    
    for(var r = 0; r < rows ; r++) {
	matrix.push([]);
	for(var c = 0; c < cols; c++) {
	    matrix[r].push(0);
	}
    }
    alert(matrix);
}

function animate() {

}


init();
