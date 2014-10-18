var canvas = false, context = false;
var scale = 3, offsetX = window.innerWidth / scale / 2, offsetY = window.innerHeight / scale / 2;
var redraw = false;
var delta = 0, lastFrameTime = 0;
var chunks = [];

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

    // Some basic intialization
    var colors = [[255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]];

    for(var chunk = 0; chunk < 25; chunk++) {
        var blocks = [];

        for(var x = 0; x < Chunk.Size; x++) {
            for(var y = 0; y < Chunk.Size; y++) {
                blocks.push(
                    new Block(x, y, colors[Math.floor(Math.random() * colors.length)])
                );
            }
        }

        chunks.push(
            new Chunk((chunk % 5) - 3.25, (Math.floor(chunk / 5)) - 3.25, blocks)
        );
    }

    // Start drawing
    window.requestAnimationFrame(update);
});

window.addEventListener('resize', function() {
    // Resize the canvas (not sure why CSS styles don't affect these values)
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    redrawCanvas();
});

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

        chunks.forEach(function(chunk) {
            chunk.render(context, offsetX, offsetY);
        });
    context.restore();

    // Display FPS
    context.font = '16pt Consolas';
    context.fillStyle = 'white';
    context.textBaseline = 'top';
    context.fillText('FPS: ' + Math.round(1 / (delta / 1000)), 15, 15);
}
