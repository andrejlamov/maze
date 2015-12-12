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

var dudes = [];

var fps = 0;
var fpsCount = 0;
var fpsStamp = 0;

var matrix = [];

function init() {
    dudes.push({dx:0, dy:0, tx:0 , ty:0, color: "rgb(0,200,0)", keys: "&%('"}); // Arrow keys
    dudes.push({dx:0, dy:0, tx:0 , ty:0, color: "rgb(200,0,0)", keys: "WASD"});

    for(var x = 0; x < cols; x++) {
        matrix.push([]);
        for(var y = 0; y < rows; y++) {
            var cell = up | down | left | right;
            matrix[x].push(cell);
        }
    }
    document.onkeydown = keydownhandler;
    makePath();
    window.requestAnimationFrame(repaint);
}

function repaint(ts) {
    cx.clearRect(0,0,w, h);
    cx.save();
    cx.translate(w / 2, h / 4);
    drawFloor();
    drawMaze();
    drawDudes()
    drawAxes()
    cx.restore();
    if(ts > fpsStamp) {
        fps = fpsCount;
        fpsStamp = ts+1000;
        fpsCount = 0;
    }
    fpsCount++;
    window.requestAnimationFrame(repaint)
}

function keydownhandler(e) {
    var c = String.fromCharCode(e.which);

    var idx = 0;
    while(dudes[idx].keys.indexOf(c) === -1 && idx < dudes.length) {
        idx++;
    }
    var d = dudes[idx];
    var keyIdx = d.keys.indexOf(c);
    if (keyIdx == 0 && !(matrix[d.dx][d.dy] & up)) {
        d.dy--;
        d.ty = d.dy+1;
        d.tx = d.dx
    } else if (keyIdx == 1 && !(matrix[d.dx][d.dy] & left)) {
        d.dx--;
        d.tx = d.dx+1;
        d.ty = d.dy;
    } else if (keyIdx == 2 && !(matrix[d.dx][d.dy] & down)) {
        d.dy++;
        d.ty = d.dy-1;
        d.tx = d.dx;
    } else if (keyIdx == 3 && !(matrix[d.dx][d.dy] & right)) {
        d.dx++;
        d.tx = d.dx-1;
        d.ty = d.dy
    }
}

function makePath() {
    // Implements a randomized Prim's algorithm (from Wikipedia)
    // Start with a grid full of walls.

    var directionVectors = {
        [up]:    [0, -1],
        [right]: [1,  0],
        [down]:  [0,  1],
        [left]:  [-1, 0]
    }

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

function drawMaze() {
    var x = 0;
    var y = 0;
    var sub_x = 0;
    var sub_y = 0;
    while(true) {
       sub_x = x;
        sub_y = y;
        while(sub_x >= 0 && sub_y < rows) {
           drawCell(sub_y, sub_x);
           sub_x --;
           sub_y ++;
       }
        if(x < cols - 1) {
           x++;
       } else if (y < rows - 1) {
           y++;
       } else {
           break;
       }
    }
}

function drawAxes() {
    cx.fillStyle = "black";
    cx.save()
    cx.translate(-15,-60);
    cx.fillText(fps + " FPS", 0, 15);
    cx.restore()

    cx.save()
    cx.translate(-20 + cols * wpx / 2 - rows * wpx / 2, 20 + cols * hpx / 2 + rows * hpx / 2);

    cx.fillText("W,A,S,D to move red", 0, 0);
    cx.fillText("Arrows to move green", 0, 10);
    cx.restore()

}

function drawFloor() {
    cx.beginPath();
    cx.moveTo(0,-hpx/2);
    cx.lineTo(wpx/2 * cols, hpx/2 * cols - hpx/2);
    cx.lineTo(0, hpx * rows - hpx/2);
    cx.lineTo(-wpx/2 * cols, hpx/2 * cols - hpx/2);
    cx.closePath();
    cx.fillStyle = "rgb(240, 240, 240)";
    cx.fill();
}


function redraw(x, y, direction) {
    drawCell(x, y, direction)
    if(x < cols-1 && matrix[x+1][y] & down ) {
        redraw(x+1, y, direction)
    }
    if(y < rows-1 && matrix[x][y+1] & right) {
        redraw(x, y+1, direction)
    }
}

function drawDudes() {
    dudes.sort(function(a, b){
        var pa = a.dx + a.dy + a.tx + a.ty;
        var pb = b.dx + b.dy + b.tx + b.ty;
        if(pa == pb) {
            var da = a.dx == a.tx ? a.ty : a.tx;
            var db = b.dx == b.tx ? b.ty : b.tx;
            return db - da;
        } else {
            return pa - pb;
        }
    });
    dudes.forEach(function(d) {
        paintDude(d.dx, d.dy, d.tx, d.ty, d.color);
        var dirx = d.dx-d.tx;
        var diry = d.dy-d.ty;
        redraw(d.tx, d.ty, down | right);
        redraw(d.dx, d.dy, down | right);
    });
}

function drawCell(x, y, repaint) {
    if (x < 0 || y < 0 || x >= cols || y >= rows) {
        return
    }

    var status = matrix[x][y];
    if(repaint != undefined) {
        status = repaint & status
    }

    function maybeDraw(px, py, x, y, maybe) {
    if (maybe & (left | right)) {
        cx.fillStyle = "rgb(200,200,200)";
    } else {
        cx.fillStyle = "rgb(180,180,180)";
    }
        if(status & maybe) {
            cx.beginPath();
            cx.moveTo(px, py);
            cx.lineTo(px, py - hpx/2);
            cx.lineTo(x, y - hpx/2);
            cx.lineTo(x, y)
            cx.closePath();
            cx.fill();
            cx.beginPath();
            cx.moveTo(x, y - hpx/2);
            cx.lineTo(px, py -hpx/2);
            cx.stroke();
        } else {
            cx.moveTo(x, y);
        }
    }
    cx.save();
    cx.lineWidth = 2;
    cx.strokeStyle = "rgb(230, 230, 230)";
    cx.translate(x * wpx / 2 - y * wpx / 2, x * hpx / 2 + y * hpx / 2);

    if(repaint != undefined) {
        cx.moveTo(0, -hpx/2);
        cx.lineTo(wpx/2, 0);
        cx.lineTo(0, hpx/2);
        cx.lineTo(-wpx/2, 0);
        cx.closePath();
        cx.fillStyle = "rgba(230, 0, 0, 0.2)";
        cx.fill();
    }

    maybeDraw(0, -hpx/2, wpx/2, 0, up);
    maybeDraw(-wpx/2, 0, 0, -hpx/2, left);
    maybeDraw(0, hpx/2, -wpx/2, 0, down);
    maybeDraw(wpx/2, 0, 0, hpx/2, right);
    cx.restore();
}

function paintDude(dx, dy, tx, ty, rgb) {

    cx.save();
    cx.translate(dx * wpx / 2 - dy * wpx / 2, dx * hpx / 2 + dy * hpx / 2);
    if(ty != dy || tx != dx) {
        cx.translate((0.5 + Math.sin((new Date()).getTime()/150) / 2) * ((tx-dx) * wpx / 2 - (ty-dy) * wpx / 2),
                     (0.5 + Math.sin((new Date()).getTime()/150) / 2) * ((tx-dx) * hpx / 2 + (ty-dy) * hpx / 2));
    }
    cx.fillStyle = rgb;
    cx.fillRect(-wpx/4, -hpx, 2 * wpx/4,  hpx);
    cx.fillStyle = "rgb(0, 0, 0)";
    cx.fillRect(-wpx/6, -hpx/1.2 ,wpx /5, hpx / 3);
    cx.fillRect(wpx/9, -hpx/1.2  ,wpx /5, hpx / 3);
    cx.restore();
}

init();
