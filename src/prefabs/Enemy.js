class Enemy extends BaseEntity {
    constructor(scene, x, y, texture, frame, health, pushForce = 0, pushSpeed = 0) {
        super(scene, x, y, texture, frame, health, pushForce, pushSpeed)
        this.arm = new Arm(scene, this, this.width/4, -this.height/4, 'arm', this.direction, [0, 0], this.width * 4, 'laserParticle')

        this.scene.time.delayedCall(1000, this.attack, null, this)
    }

    update() {
        this.direction = (this.x - this.scene.player.x > 0) ? -1: 1
        //console.log(this.direction)

        let dt = this.scene.game.loop.delta
        this.arm.update(dt, this.direction, 0)

        super.update()
    }

    die(){
        this.arm.destroy()
        super.die()
    }

    attack() {
        new ProjectileBase(this.scene, this.arm.x, this.arm.y, 'bullet', null, this, 3, 1500, this.direction, Phaser.Math.RND.integerInRange(0, 255))
        //console.log('attacked')
        this.scene.time.delayedCall(3000, this.attack, null, this)
        //when the enemy dies, this has already been queued to be called in the future
        //this bugs out because 'this' does not exist since its been killed
    }
}