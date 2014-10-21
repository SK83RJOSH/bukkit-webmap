function World(name, minScale, maxScale, scale, translateX, translateY) {
    this.name = name;
    this.minScale = minScale || 2;
    this.maxScale = Math.max(this.minScale, maxScale || 4);
    this.scale = scale || this.minScale;
    this.translateX = translateX || 0;
    this.translateY = translateY || 0;

    this.chunks = [];
    this.players = {};
}

World.prototype.setMinScale = function(minScale) {
    this.minScale = Math.min(this.maxScale, minScale);
}

World.prototype.setMaxScale = function(maxScale) {
    this.maxScale = Math.max(this.minScale, maxScale);
}

World.prototype.setScale = function(scale) {
    this.scale = Math.min(this.maxScale, Math.max(this.minScale, scale));
}

World.prototype.setTranslation = function(x, y) {
    this.translateX = x;
    this.translateY = y;
}

World.prototype.setChunk = function(x, z, chunk) {
    if(!this.chunks[x]) {
        this.chunks[x] = [];
    }

    this.chunks[x][z] = chunk;
}

World.prototype.getChunk = function(x, z) {
	if(this.chunks[x]) {
        return this.chunks[x][z];
    }

    return false;
}

World.prototype.updateChunk = function(x, z, blocks) {
    var chunk = this.getChunk(x, z);

    if(chunk) {
        chunk.update(blocks);

        if(blocks && false) { // TODO: We'll want to push these updates once shading is implemented
            this.updateChunk(x - 1, z);
            this.updateChunk(x, z - 1);
            this.updateChunk(x + 1, z);
            this.updateChunk(x, z + 1);
        }
    }
}

// TODO: Decide whether or not setBlock should exist

World.prototype.getBlock = function(x, z) {
    var chunk = this.getChunk(Math.floor(x / Chunk.Size), Math.floor(z / Chunk.Size));

    if(chunk) {
        chunk.getBlocks().forEach(function(block) {
            if(block.x == x && block.z == z) {
                return block;
            }
        });
    }

    return false;
}

World.prototype.updatePlayers = function(players) {
    // Cull dead players
    for(var username in this.players) {
        if(!players[username]) {
            delete this.players[username];
        }
    }

    // Update players
    for(var username in players) {
        var player = this.players[username];
        var remotePlayer = players[username];

        if(this.players[username] && player.last_updated >= this.players[username]) {
            player.x = remotePlayer.x;
            player.z = remotePlayer.z;
            player.last_updated = remotePlayer.last_updated;
        } else if(!this.players[username]) {
            this.players[username] = new Player(username, remotePlayer.x, remotePlayer.z, remotePlayer.last_updated);
        }
    }
}

World.prototype.toWorld = function(x, y) {
    // This is MUCH more elegant in Lua; using commas to seperate values is much more intuitive than using them as operators..
    return {x: this.translateX + (x * this.scale), z: this.translateY + (y * this.scale)};
}

World.prototype.isVisible = function(context, x, z) {
    return true;
    return x >= this.translateX && x <= this.translateX + (context.canvas.width * this.scale) && z >= this.translateY && z <= this.translateY + (context.canvas.height * this.scale);
}

World.prototype.translate = function(x, y) {
    this.translateX += x;
    this.translateY += y;
}

World.prototype.zoom = function(scaleFactor) {
    var oldScale = this.scale;

    this.setScale(this.scale + scaleFactor);

    // Thanks to Vasiliy Stavenko (http://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate)
    if(oldScale != this.scale) {
        var scaleProduct = oldScale * oldScale + oldScale * scaleFactor;
        this.translate((event.clientX * scaleFactor) / scaleProduct, (event.clientY * scaleFactor) / scaleProduct);
    }
}

World.prototype.render = function(context) {
    context.save();
        context.scale(this.scale, this.scale);
        context.translate(-this.translateX, -this.translateY);

        // Render Chunks
        var topLeft = this.toWorld(0, 0);
        var bottomRight = this.toWorld(context.canvas.width, context.canvas.height);

        // This may seem overwhelming, but it's just iterating over tiles that are (partially / fully) visible.
        for(var x = Math.floor(topLeft.x / Chunk.Size); x < Math.ceil(topLeft.x / Chunk.Size) + Math.ceil(bottomRight.z / Chunk.Size); x++) {
            for(var z = Math.floor(topLeft.z / Chunk.Size); z < Math.ceil(topLeft.z / Chunk.Size) + Math.ceil(bottomRight.z / Chunk.Size); z++) {
                var chunk = this.getChunk(x, z);

                if(chunk) {
                    chunk.render(context);
                }
            }
        }

        // Render Players
        for(var username in this.players) {
            var player = this.players[username];

            if(this.isVisible(context, player.x, player.z)) {
                player.render(context);
            }
        }
    context.restore();
}
