class BaseEntity extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, health, pushForce = 0, pushSpeed = 0) {
        super(scene, x, y, texture, frame)
        //add to scene
        scene.add.existing(this)
        scene.physics.add.existing(this)
        this.body.setGravity(0, 4000)

        this.scene = scene

        //set movement control and input axis
        this.xInput = 0
        this.targetVelocity = 0

        //entity collision parameters
        this.pushForce = pushForce
        this.pushSpeed = pushSpeed

        //state and facing direction
        this.direction = 1
        this.state = 'idle'
        
        /*
        
        */

        //initial movement parameters
        this.moveSpeed = 500
        this.moveForceX = 10

        //health parameters
        this.maxHealth = health
        this.currentHealth = health

        //hit tagging
        this.rememberedHits = new Set([])
        
        this.setOrigin(0.5, 0.5)
    }

    update() {
        let dt = this.scene.game.loop.delta
        this.targetVelocity = this.xInput * this.moveSpeed

        //still modifier lowers the force applied when not actively moving
        let stillModifier = (this.xInput == 0) ? 0.5: 1
        //movement
        let force = this.moveForceX * stillModifier * dt
        this.approachVelocity('x', this.targetVelocity, force)
    }

    approachVelocity(axis, targetVelocity, force) {
        let finalVelocity
        if(this.body == null) {
            return
        }
        finalVelocity = Math.max(this.body.velocity[axis] - force, Math.min(targetVelocity, this.body.velocity[axis] + force))
        if(axis == 'x') {
            this.body.setVelocityX(finalVelocity)
        } else {
            this.body.setVelocityY(finalVelocity)
        }
    }

    changeHealth(value) {
        this.currentHealth += value
        if(this.currentHealth < 1) {
            this.die()
        } else if(this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth
        }
    }
    
    die(){
        this.destroy()
    }

    flip(){
        this.direction = this.direction * -1
        let flipped = (this.direction == 1) ? false: true
        this.setFlipX(flipped)
    }

    move(speedModifier, forceModifier, dt) {
        this.targetVelocity = this.xInput * this.moveSpeed * speedModifier
        
        let force = this.moveForceX * forceModifier * dt
        this.approachVelocity('x', this.targetVelocity, force)
        this.direction = (this.xInput == 0) ? this.direction: this.xInput
    }
}