function Chunk(x, y, blocks) {
    this.x = x;
    this.y = y;
    this.blocks = blocks;
    this.canvas = document.createElement('canvas');
    this.canvas.width = Chunk.Size;
    this.canvas.height = Chunk.Size;

    this.updateImageData();
}

Chunk.Size = 16;

Chunk.prototype.updateImageData = function() {
    var context = this.canvas.getContext('2d');
    var imageData = context.getImageData(0, 0, Chunk.Size, Chunk.Size);

    this.blocks.forEach(function(block) {
        var pixel = (((block.x % Chunk.Size) * (imageData.width * 4)) + ((block.y % Chunk.Size) * 4));

        imageData.data[pixel + 0] = block.color[0];
        imageData.data[pixel + 1] = block.color[1];
        imageData.data[pixel + 2] = block.color[2];
        imageData.data[pixel + 3] = block.color[3];

        context.putImageData(imageData, 0, 0);
    });
};

Chunk.prototype.render = function(context, offsetX, offsetY) {
    context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = context.webkitImageSmoothingEnabled = false;
    context.drawImage(this.canvas, this.x * Chunk.Size, this.y * Chunk.Size);
}
