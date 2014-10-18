var canvas = false, context = false;
var scale = 3, offsetX = window.innerWidth / scale / 2, offsetY = window.innerHeight / scale / 2;
var redraw = false;
var delta = 0, lastFrameTime = 0;

var worlds = [];
var chunks = [];
var players = {};
var currentWorld = false;

window.addEventListener('load', function() {
    // Handle cross-browser compatibility
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;

    // Setup the canvas
    canvas = document.getElementById('webmap');
    canvas.addEventListener('mousedown', function(event) {
        var lastMouseX = event.clientX;
        var lastMouseY = event.clientY;

        function mousemove(event) {
            offsetX += (event.clientX - lastMouseX) / scale;
            lastMouseX = event.clientX;

            offsetY += (event.clientY - lastMouseY) / scale;
            lastMouseY = event.clientY;

            redrawCanvas();
        }

        function mouseup() {
            canvas.removeEventListener('mouseup', mouseup);
            canvas.removeEventListener('mousemove', mousemove);
        }

        canvas.addEventListener('mousemove', mousemove);
        canvas.addEventListener('mouseup', mouseup);
    });

    function mousewheel(event) {
        var oldScale = scale;

        scale += Math.max(-1, Math.min(1, event.wheelDelta || -event.detail)) / 2;
        scale = Math.min(4, Math.max(2, scale));

        // Thanks to Vasiliy Stavenko (http://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate)
        if(oldScale != scale) {
            var scaleFactor = scale - oldScale;
            var scaleProduct = oldScale * oldScale + oldScale * scaleFactor;

            offsetX = offsetX - ((event.clientX * scaleFactor) / scaleProduct);
            offsetY = offsetY - ((event.clientY * scaleFactor) / scaleProduct);

            redrawCanvas();
        }
    }

    canvas.addEventListener('mousewheel', mousewheel);
    canvas.addEventListener('DOMMouseScroll', mousewheel);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Instantiate canvas context
    context = canvas.getContext('2d');

    // Fetch intial data
    fetchJSON('data/world-index.json', function(response) {
        worlds = response;
        currentWorld = response[0];

        fetchChunks();
        fetchPlayers();
    });

    // Start drawing
    window.requestAnimationFrame(update);
});

window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    redrawCanvas();
});

function fetchJSON(url, callback) {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
            if(xhr.status == 200) {
                callback(JSON.parse(xhr.response));
            }
        }
    };
    xhr.send();
}

function fetchChunks() {
    fetchJSON('data/' + currentWorld + '/chunk-index.json', function(response) {
        for(var x in response) {
            for(var y in response[x]) {
                var chunk = response[x][y];

                if(isChunkVisible(x, y)) {
                    if(!chunks[x] || !chunks[x][y] || chunk.last_updated >= chunks[x][y].last_updated) {
                        fetchJSON('data/' + currentWorld + '/' + x + '.' + y + '.json', function(response) {
                            var blocks = [];

                            response.forEach(function(block) {
                                blocks.push(new Block(block.x, block.y, Block.IDtoColor(block.id)));
                            });

                            var x = blocks[0].x / Chunk.Size;
                            var y = blocks[0].y / Chunk.Size;

                            if(!chunks[x]) {
                                chunks[x] = [];
                            }

                            chunks[x][y] = new Chunk(x, y, blocks);
                            redrawCanvas();
                        });
                    }
                }
            }
        }
    });

    setTimeout(fetchChunks, 5000);
}

function fetchPlayers() {
    fetchJSON('data/' + currentWorld + '/players.json', function(response) {
        for(var username in response) {
            var player = response[username];

            if(!players[username]) {
                players[username] = new Player(username, player.x, player.y);

                redrawCanvas();
            } else {
                players[username].x = player.x;
                players[username].y = player.y;

                redrawCanvas();
            }
        }
    });

    setTimeout(fetchPlayers, 5000);
}

function isChunkVisible(x, y) {
    if(x >= Math.floor(-offsetX / Chunk.Size) && x <= Math.ceil(-offsetX / Chunk.Size) + Math.ceil(window.innerWidth / (Chunk.Size * scale))) {
        if(y >= Math.floor(-offsetY / Chunk.Size) && y <= Math.ceil(-offsetY / Chunk.Size) + Math.ceil(window.innerHeight / (Chunk.Size * scale))) {
            return true;
        }
    }

    return false;
}

function redrawCanvas() {
    if(!redraw) {
        window.requestAnimationFrame(function(time) {
            update(time);
            redraw = false;
        });

        redraw = true;
    }
}

function update(time) {
    // Update times
    delta = time - lastFrameTime;
    lastFrameTime = time;

    // Reset the canvas
    canvas.width = canvas.width;

    // Draw scene
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.save();
        // Translate & Scale
        context.scale(scale, scale);
        context.translate(offsetX, offsetY);

        // Only render visible chunks
        for(var x = Math.floor(-offsetX / Chunk.Size); x < Math.ceil(-offsetX / Chunk.Size) + Math.ceil(window.innerWidth / (Chunk.Size * scale)); x++) {
            for(var y = Math.floor(-offsetY / Chunk.Size); y < Math.ceil(-offsetY / Chunk.Size) + Math.ceil(window.innerHeight / (Chunk.Size * scale)); y++) {
                if(chunks[x] && chunks[x][y]) {
                    chunks[x][y].render(context);
                }
            }
        }

        // Render Players
        for(var username in players) {
            players[username].render(context);
        }
    context.restore();

    // Display FPS
    context.font = '16pt Consolas';
    context.fillStyle = 'white';
    context.textBaseline = 'top';
    context.fillText('FPS: ' + Math.round(1 / (delta / 1000)), 15, 15);
}
