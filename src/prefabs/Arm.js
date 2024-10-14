class Arm extends Phaser.GameObjects.Sprite {
    constructor(scene, owner, forwardOffset, upOffset, texture, direction, origin) {
        super(scene, owner.x + forwardOffset * direction, owner.y + upOffset * direction, texture)
        //add to scene
        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.setOrigin(origin[0], origin[1])
        this.rotatePoint = origin

        this.offset = {x: forwardOffset, y: upOffset}

        this.scene = scene
        this.owner = owner

        //arm parameters

    }

    update(dt, direction, targetAngle) {
        this.setPosition(this.owner.x + this.offset['x'] * direction, this.owner.y + this.offset['y'])
        this.body.setVelocity(this.owner.body.velocity['x'], this.owner.body.velocity['y'])
        let flipped = (direction == 1) ? false: true
        this.setFlipX(flipped)
        if(flipped) {
            this.setOrigin(1 - this.rotatePoint[0], this.rotatePoint[1])
        } else {
            this.setOrigin(this.rotatePoint[0], this.rotatePoint[1])
        }
    }
}