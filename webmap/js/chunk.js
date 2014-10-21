function Chunk(world, x, z, last_updated) {
    this.world = world;
    this.x = x;
    this.z = z;
    this.last_updated = last_updated;
    this.blocks = [];
    this.canvas = document.createElement('canvas');
    this.canvas.width = Chunk.Size;
    this.canvas.height = Chunk.Size;
}

Chunk.Size = 16;

Chunk.prototype.updateImageData = function() {
    var world = this.world;
    var context = this.canvas.getContext('2d');
    var imageData = context.getImageData(0, 0, Chunk.Size, Chunk.Size);

    this.blocks.forEach(function(block) {
        var pixel = (((Math.abs(block.x) % Chunk.Size) * (imageData.width * 4)) + ((Math.abs(block.z) % Chunk.Size) * 4));
        var color = block.getColor();
        var light = 0;

        // TODO: Figure out why this doesn't work as expected (Scope issues?...)
        // if(currentWorld.getBlock(block.x, block.z + 1)) {
        //     console.log(block.x);
        //     light = 100;
        // }

        imageData.data[pixel + 0] = Math.min(255, color[0] + light);
        imageData.data[pixel + 1] = Math.min(255, color[1] + light);
        imageData.data[pixel + 2] = Math.min(255, color[2] + light);
        imageData.data[pixel + 3] = color[3];

        context.putImageData(imageData, 0, 0);
    });
};

Chunk.prototype.update = function(blocks) {
    if(blocks) {
        this.blocks = blocks;
    }

    this.updateImageData();
}

// TODO: Optimize
// If all else fails, we could just retool this to use a 3D context w/ shaders.
Chunk.prototype.render = function(context) {
    context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = context.webkitImageSmoothingEnabled = false;
    context.drawImage(this.canvas, this.x * Chunk.Size, this.z * Chunk.Size);
}
