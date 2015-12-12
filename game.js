var socket = io();

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
var myid = null;


var fps = 0;
var fpsCount = 0;
var fpsStamp = 0;

var matrix = [];

var keys = "WASD";

function init() {
    document.onkeydown = keydownhandler;
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
    var keyIdx = keys.indexOf(c);

    var d = dudes.find(function(d) {
        return d.id == myid;
    });

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

    socket.emit('dudes', dudes);
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
    cx.translate(-30 + cols * wpx / 2 - rows * wpx / 2, 20 + cols * hpx / 2 + rows * hpx / 2);

    cx.fillText("W,A,S,D to move", 0, 0);
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
        return (a.dx + a.dy) - (b.dx + b.dy);
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

socket.on('world', function(d) {
    matrix = d.matrix;
    dudes = d.dudes;
    cols = d.cols;
    rows = d.rows;
    myid = d.myid;

    wpx = w / cols;
    hpx = h / rows / 2;

    init();
});

socket.on('update', function(d) {
    dudes = d;
    drawDudes();
});
