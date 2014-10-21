function Chunk(x, z) { // TODO: Add last_updated to constructor
    this.x = x;
    this.z = z;
    this.last_updated = new Date().getTime() / 1000; // If the player isn't in the same timezone as the server this will result in constant or no updates..
    this.blocks = [];
    this.canvas = document.createElement('canvas');
    this.canvas.width = Chunk.Size;
    this.canvas.height = Chunk.Size;
}

Chunk.Size = 16;

Chunk.prototype.updateImageData = function() {
    var context = this.canvas.getContext('2d');
    var imageData = context.getImageData(0, 0, Chunk.Size, Chunk.Size);

    this.blocks.forEach(function(block) {
        var pixel = (((Math.abs(block.x) % Chunk.Size) * (imageData.width * 4)) + ((Math.abs(block.z) % Chunk.Size) * 4));

        imageData.data[pixel + 0] = block.getColor()[0];
        imageData.data[pixel + 1] = block.getColor()[1];
        imageData.data[pixel + 2] = block.getColor()[2];
        imageData.data[pixel + 3] = block.getColor()[3];

        context.putImageData(imageData, 0, 0);
    });
};

Chunk.prototype.update = function(blocks) {
    if(blocks) {
        this.blocks = blocks;
    }

    this.updateImageData();
}

// TODO: Optimize & add shading (something similar to the maps ingame should be pretty easy -- just check the block height above / below this one)
// This could be faster, although this is much faster than fillRect, this is still pretty slow..
// Perhaps it's possible to use context.setImageData(...) and do some sort of progmatic scaling?
// If all else fails, we could just retool this to use a 3D context w/ shaders.
Chunk.prototype.render = function(context) {
    context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = context.webkitImageSmoothingEnabled = false;
    context.drawImage(this.canvas, this.x * Chunk.Size, this.z * Chunk.Size);
}
