class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, pushForce = 0, pushSpeed = 0) {
        super(scene, x, y, texture, frame)
        //add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene

        //set up parameters
        this.moveSpeed = 500
        this.moveForceX = 10
        this.xInput = 0
        this.targetVelocity = 0

        this.pushForce = pushForce
        this.pushSpeed = pushSpeed
    }

    update(dt) {
        this.xInput = Math.abs(this.scene.player.x - this.x) / (this.scene.player.x - this.x)
        this.xInput = 0
        this.targetVelocity = this.xInput * this.moveSpeed

        //still modifier lowers the force applied when not actively moving
        let stillModifier = (this.xInput == 0) ? 0.5: 1

        let finalVelocity = Math.max(this.body.velocity.x - this.moveForceX * stillModifier * dt, Math.min(this.targetVelocity, this.body.velocity.x + this.moveForceX * stillModifier * dt))
        
        this.body.setVelocityX(finalVelocity)
        
        this.direction = (this.xInput == 0) ? this.direction: this.xInput

    }
}