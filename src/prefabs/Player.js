class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)
        //add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        //set up parameters
        this.moveSpeed = 1
        console.log('created player')
        console.log(texture)
    }
    update(dt) {
        if(true) {
            if(keyLEFT.isDown) {
                this.x -= this.moveSpeed * dt
            } else if(keyRIGHT.isDown) {
                this.x += this.moveSpeed * dt
            }
        }
    }
}