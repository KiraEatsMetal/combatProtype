class Arm extends Phaser.GameObjects.Sprite {
    constructor(scene, owner, forwardOffset, upOffset, texture, direction, origin, laserLength, laserTexture) {
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
        this.angularVelocity = 0
        this.armForce = 0.2

        this.armLength = this.width * (1 - this.originX)
        this.laserLength = laserLength
        this.laserAimAngle = 0

        //laser
        if(laserLength > 0) {
            let armEndpoint = [this.x + this.armLength, this.y]
            this.laserLine = new Phaser.Geom.Line(armEndpoint[0], armEndpoint[1], armEndpoint[0] + laserLength * direction, armEndpoint[1])

            // set up particle emitter  
            this.laserEmitter = scene.add.particles(0, 0, laserTexture, {
                lifespan: 20,
                alpha: {
                    start: 1,
                    end: 0
                },
                emitZone: { 
                    type: 'random', 
                    source: this.laserLine, 
                    quantity: 1000
                },
                blendMode: 'ADD',
                quantity: laserLength/10
            }).setParticleScale(1.5)
        }
        this.oldPos = [this.x, this.y]
        console.log(this.laserLine)
    }

    update(dt, direction, targetAngle) {
        //this.flip()
        //stick with the body
        this.setPosition(this.owner.x + this.offset['x'] * direction, this.owner.y + this.offset['y'])
        this.body.setVelocity(this.owner.body.velocity['x'], this.owner.body.velocity['y'])

        //flip with the body
        let flipped = (direction == 1) ? false: true

        //track aim target
        this.setAngle(this.angle + this.angularVelocity)
        let force = this.armForce * dt

        targetAngle = (flipped == false) ? -targetAngle: targetAngle
        console.log(targetAngle)
        
        this.approachAngle(targetAngle, 1, force)
        if(this.laserLine) {
            //adjusting laser angle since the raw arm angle is incorrect when flipped due to how flipx works
            this.laserAimAngle = (flipped == false) ? this.angle: 180 + this.angle
            
            let laserDirection = [Math.cos(Phaser.Math.DegToRad(this.laserAimAngle)), Math.sin(Phaser.Math.DegToRad(this.laserAimAngle))]
            let laserArmLength = (this.armLength + this.laserLength)
            //console.log(laserDirection)
            
            this.laserLine.setTo(this.x + laserDirection[0] * this.armLength, this.y + laserDirection[1] * this.armLength, this.x + laserDirection[0] * laserArmLength, this.y + laserDirection[1] * laserArmLength)
        }
        this.oldPos = [this.x, this.y]
    }

    approachAngle(targetAngle, maxAngularVelocity, force) {
        //in degrees
        //prefer strong tracking and overshoot potential to weaker tracking that doesn't overshoot
        let angleDiff = targetAngle - this.angle
        let targetAngularVelocity = Math.max(-maxAngularVelocity, Math.min(angleDiff, maxAngularVelocity))

        this.approachAngularVelocity(targetAngularVelocity, force)
        //console.log(force)
    }

    approachAngularVelocity(targetAngularVelocity, force){
        let finalAngularVelocity = Math.max(this.angularVelocity - force, Math.min(targetAngularVelocity, this.angularVelocity + force))
        this.angularVelocity = finalAngularVelocity
    }

    destroy() {
        if(this.laserEmitter){
            this.laserEmitter.destroy()
        }
        super.destroy()
    }

    flip() {
        this.setAngle(this.angle * -1)
        this.setFlipX(!(this.flipX))
        if(this.flipX) {
            this.setOrigin(1 - this.rotatePoint[0], this.rotatePoint[1])
        } else {
            this.setOrigin(this.rotatePoint[0], this.rotatePoint[1])
        }
        let angleAdjust
        //console.log(this.angle)
        if(this.angle > 0) {
            angleAdjust = 90 - this.angle
        } else {
            angleAdjust = -90 - this.angle
        }
        //console.log(angleAdjust)
        this.setAngle(this.angle + angleAdjust/2)
    }
}