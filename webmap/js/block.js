function Block(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
}

Block.colors = {
    '-1': [255, 0, 255, 0],
    '0': [0, 0, 0, 0],
    '1': [116, 116, 116, 255],
    '2': [89, 149, 50, 255],
    '3': [121, 85, 58, 255]
};

Block.IDtoColor = function(id) {
    return Block.colors[id] || Block.colors[-1];
}
