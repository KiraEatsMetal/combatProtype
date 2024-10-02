class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)
        //add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        //set up parameters
        this.moveSpeed = 8/10
        console.log('created player')
        console.log(texture)
        this.direction = 0
        this.dodgeDistance = 100
        this.dodging = false
        this.dodgeCooldown = 500
        this.dodgeCool = 0
    }
    update(dt) {
        //cooldown defensive ability
        this.dodgeCool = Math.max(0, this.dodgeCool - dt)
        //console.log(this.dodgeCool)

        if(true) { //this part is placeholder for preventing movement while attacking
            if(Phaser.Input.Keyboard.JustDown(keyDODGE) && this.dodgeCool == 0) {
                this.x += this.dodgeDistance * this.direction
                this.dodgeCool = this.dodgeCooldown
            }
            if(keyLEFT.isDown) {
                this.x -= this.moveSpeed * dt
                this.direction = -1
            } else if(keyRIGHT.isDown) {
                this.x += this.moveSpeed * dt
                this.direction = 1
            }
        }
    }
}