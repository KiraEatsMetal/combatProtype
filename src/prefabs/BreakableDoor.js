class BreakableDoor extends BaseEntity {
    constructor(scene, x, y, texture, frame, health) {
        let pushForce = 100
        let pushSpeed = 10
        super(scene, x, y, texture, frame, health, pushForce, pushSpeed)
        this.body.setImmovable(true)
        this.body.setGravity(0, 0)


        //debug
    }

    update() {
        this.approachVelocity('x', 0, 9999)
        this.approachVelocity('y', 0, 9999)
    }
}