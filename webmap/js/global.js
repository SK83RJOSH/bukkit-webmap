var canvas = false;
var context = false;
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
            currentWorld.zoom(Math.max(-1, Math.min(1, event.wheelDelta || -event.detail)) / 2, event.clientX, event.clientY);
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

            // Start fetching
            fetchChunks();
            setTimeout(fetchChunks, 15000);

            fetchPlayers();
            setTimeout(fetchPlayers, 2500);
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

function fetchChunks() {
    var world = currentWorld;

    fetchJSON('data/' + world.name + '/chunk-index.json', function(response) {
        for(var x in response) {
            for(var z in response[x]) {
                var chunk = response[x][z];

                if(!world.getChunk(x, z) || chunk.last_updated > world.getChunk(x, z).last_updated) {
                    if(!world.getChunk(x, z)) {
                        world.setChunk(x, z, new Chunk(world, x, z, chunk.last_updated));
                    }

                    fetchJSON('data/' + world.name + '/' + x + '.' + z + '.json', function(response) {
                        var blocks = [];

                        response.forEach(function(block) {
                            blocks.push(new Block(block.x, block.z, block.material));
                        });

                        world.updateChunk(blocks[0].x / Chunk.Size, blocks[0].z / Chunk.Size, blocks);
                        redrawCanvas();
                    });
                }
            }
        }
    });
}

function fetchPlayers() {
    var world = currentWorld;

    fetchJSON('data/' + world.name + '/players.json', function(players) {
        world.updatePlayers(players);
        redrawCanvas();
    });
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
