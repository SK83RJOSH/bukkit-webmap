var canvas = false, context = false;
var redraw = false;
var worlds = [];
var currentWorld = false;

// TODO: Implement UI & world switching

window.addEventListener('load', function() {
    // Handle cross-browser compatibility
    window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;

    // Setup the canvas
    canvas = document.getElementById('webmap');
    canvas.addEventListener('mousedown', function(event) {
        var lastMouseX = event.clientX;
        var lastMouseY = event.clientY;

        function mousemove(event) {
            if(currentWorld) {
                currentWorld.translate(-(event.clientX - lastMouseX) / currentWorld.scale, -(event.clientY - lastMouseY) / currentWorld.scale);
                redrawCanvas();
            }

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        }

        function mouseup() {
            canvas.removeEventListener('mouseup', mouseup);
            canvas.removeEventListener('mousemove', mousemove);
        }

        canvas.addEventListener('mousemove', mousemove);
        canvas.addEventListener('mouseup', mouseup);
    });

    function mousewheel(event) {
        if(currentWorld) {
            currentWorld.zoom(Math.max(-1, Math.min(1, event.wheelDelta || -event.detail)) / 2);
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

        if(response[0]) {
            currentWorld = new World(response[0]);

            currentWorld.translate(-canvas.width / currentWorld.scale / 2, -canvas.height / currentWorld.scale / 2);

            fetchChunks();
            fetchPlayers();
        }
    });

    // Start drawing
    window.requestAnimationFrame(render);
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

// TODO: Move fetches into World

function fetchChunks() {
    var world = currentWorld;

    fetchJSON('data/' + currentWorld.name + '/chunk-index.json', function(response) {
        if(world != currentWorld) { return; } // Prevent modifications if the world has changed

        for(var x in response) {
            for(var z in response[x]) {
                var chunk = response[x][z];

                if(currentWorld.isVisible(x * Chunk.Size, z * Chunk.Size)) {
                    fetchJSON('data/' + currentWorld.name + '/' + x + '.' + z + '.json', function(response) {
                        if(world != currentWorld) { return; } // Prevent modifications if the world has changed

                        var blocks = [];

                        response.forEach(function(block) {
                            blocks.push(new Block(block.x, block.z, block.material));
                        });

                        var chunk = currentWorld.getChunk(blocks[0].x / Chunk.Size, blocks[0].z / Chunk.Size);

                        if(!chunk) {
                            var chunk = new Chunk(blocks[0].x / Chunk.Size, blocks[0].z / Chunk.Size);
                            currentWorld.setChunk(chunk.x, chunk.z, chunk);
                        }

                        currentWorld.updateChunk(chunk.x, chunk.z, blocks);
                        redrawCanvas();
                    });
                }
            }
        }
    });

    setTimeout(fetchChunks, 5000);
}

function fetchPlayers() {
    var world = currentWorld;

    fetchJSON('data/' + currentWorld.name + '/players.json', function(players) {
        if(world != currentWorld) { return; } // Prevent modifications if the world has changed

        currentWorld.updatePlayers(players);
        redrawCanvas();
    });

    setTimeout(fetchPlayers, 5000);
}

function redrawCanvas() {
    if(!redraw) {
        window.requestAnimationFrame(function() {
            render();
            redraw = false;
        });

        redraw = true;
    }
}

function render(time) {
    // Reset the canvas
    canvas.width = canvas.width;

    // Draw scene
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    if(currentWorld) {
        currentWorld.render(context);
    }
}
