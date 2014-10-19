function Player(username, x, z, last_updated) {
    this.username = username;
    this.x = x;
    this.z = z;
    this.last_updated = last_updated;
    this.image = new Image();
    this.image.src = 'https://minotar.net/helm/' + username + '/8.png';
}

Player.prototype.render = function(context) {
    context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = context.webkitImageSmoothingEnabled = false;
    context.drawImage(this.image, this.x - this.image.width / 2, this.z - this.image.height / 2);

    context.font = '3.5pt Minecraft';
    context.textAlign = 'center';
    context.fillStyle = 'white';
    context.fillText(this.username, this.x, this.z - this.image.height / 1.5);
}
