function Player(username, x, y) {
    this.username = username;
    this.x = x;
    this.y = y;
    this.last_updated = new Date().getTime() / 1000;
    this.image = new Image();
    this.image.src = 'https://minotar.net/helm/' + username + '/8.png';
}

Player.prototype.render = function(context) {
    context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = context.webkitImageSmoothingEnabled = false;
    context.drawImage(this.image, this.x - (this.image.width / 2 * scale), this.y - (this.image.height / 2 * scale));
}
