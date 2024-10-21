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
        this.armForce = 0

        //laser
        if(laserLength > 0) {
            console.log(laserLength)
            
            let armEndpoint = [this.x + this.width, this.y + this.height]
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
        //stick with the body
        this.setPosition(this.owner.x + this.offset['x'] * direction, this.owner.y + this.offset['y'])
        this.body.setVelocity(this.owner.body.velocity['x'], this.owner.body.velocity['y'])

        //flip with the body
        let flipped = (direction == 1) ? false: true
        this.setFlipX(flipped)
        if(flipped) {
            this.setOrigin(1 - this.rotatePoint[0], this.rotatePoint[1])
        } else {
            this.setOrigin(this.rotatePoint[0], this.rotatePoint[1])
        }

        //track aim target
        this.setAngle(this.angle + this.angularVelocity)
        let force = this.armForce * dt
        this.approachAngle(targetAngle, 10, force)
        if(this.laserLine) {
            Phaser.Geom.Line.Offset(this.laserLine, this.x - this.oldPos[0], this.y - this.oldPos[1])
            Phaser.Geom.Line.RotateAroundXY(this.laserLine, this.x, this.y, Phaser.Math.DegToRad(10))
        }
        this.oldPos = [this.x, this.y]
    }

    approachAngle(targetAngle, maxAngularVelocity, force) {
        //in degrees
        //prefer strong tracking and overshoot potential to weaker tracking that doesn't overshoot
        let angleDiff = targetAngle - this.angle

        this.approachAngularVelocity(angleDiff, force)
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
}