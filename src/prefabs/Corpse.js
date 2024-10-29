class Corpse extends BaseEntity {
    constructor(scene, x, y, texture, frame, health) {
        let pushForce = 40
        let pushSpeed = 300
        super(scene, x, y, texture, frame, health, pushForce, pushSpeed)
    }

    update() {
        let dt = this.scene.game.loop.delta
        this.xInput = 0
        this.move(0, 0.5, dt)
    }

    die() {
        this.scene.player.changeHealth(1)
        super.die()
    }
}