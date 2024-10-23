class Enemy extends BaseEntity {
    constructor(scene, x, y, texture, frame, health, pushForce = 0, pushSpeed = 0) {
        super(scene, x, y, texture, frame, health, pushForce, pushSpeed)
        this.arm = new Arm(scene, this, this.width/4, -this.height/4, 'arm', this.direction, [0, 0], this.width * 8, 'laserParticle')

        //this.scene.time.delayedCall(1000, this.attack, null, this)
        //sight box
        this.sightBox = scene.add.rectangle(x, y, this.width * 12, this.height * 2, 0xffffff, 0).setOrigin(0.25, 0.5)
        scene.physics.add.existing(this.sightBox)
        this.sightBox.owner = this

        //enemy params
        this.idleFlipCooldown = 0

        this.flipCooldown = 100
        this.flipCool = 0

        this.aimCooldown = 1000
        this.aimCool = 0

        this.attackCooldown = 200
        this.attackCool = 0

        this.attackClip = 3
        this.attackCount = 0

        this.hurtCooldown = 50
        this.hurtCool = 0


        //state machine
        this.stateMachine = new StateMachine('idle', {
            idle: new GuardIdleState(),
            move: new GuardApproachState(),
            aiming: new GuardAimingState(),
            aimed: new GuardAimedState(),
            hurt: new GuardHurtState(),
            die: new GuardDieState()
        }, [this.scene, this])

        //debug
    }

    update() {
        let dt = this.scene.game.loop.delta
        this.sightBox.x = this.x
        this.sightBox.y = this.y

        //super.update()
        this.stateMachine.step()
        this.cooldown(dt)
    }

    die(){
        this.arm.destroy()
        this.stateMachine.transition('die')
        super.die()
    }

    attack() {
        let aimAngle = (this.arm.flipX) ? 180-this.arm.angle: -this.arm.angle
        new ProjectileBase(this.scene, this.arm.x, this.arm.y, 'bullet', null, this, 3, 2000, aimAngle, Phaser.Math.RND.integerInRange(0, 255))
        this.attackCool = this.attackCooldown
        this.attackCount += 1
        //when the enemy dies, this has already been queued to be called in the future
        //this bugs out because 'this' does not exist since its been killed
    }

    getAimAngle(target, arm) {
        let coords = new Phaser.Math.Vector2(target.x - arm.x, target.y - arm.y)
        //coords.normalize()
        let angle = Math.atan2(-coords.y, coords.x)
        angle = Phaser.Math.RadToDeg(angle)
        return angle
    }

    flip() {
        this.arm.flip()
        super.flip()
        this.flipCool = this.flipCooldown

        if(this.direction == 1) {
            this.sightBox.setOrigin(0.25, 0.5)
        } else {
            this.sightBox.setOrigin(0.75, 0.5)
        }
    }

    cooldown(dt) {
        //cooldown idle flip
        this.idleFlipCooldown = Math.max(0, this.idleFlipCooldown - dt)

        //cooldown flip
        this.flipCool = Math.max(0, this.flipCool - dt)
        
        //cooldown aim
        this.aimCool = Math.max(0, this.aimCool - dt)
        
        //cooldown attack
        this.attackCool = Math.max(0, this.attackCool - dt)

        //cooldown damage stun
        this.hurtCool = Math.max(0, this.hurtCool - dt)
    }
}

class GuardIdleState extends State {
    enter(scene, guard) {
        guard.arm.laserEmitter.stop()

    }

    execute(scene, guard) {
        let dt = scene.game.loop.delta
        let aimAngle = -90
        guard.arm.update(dt, guard.direction, aimAngle)

        if(guard.idleFlipCooldown == 0) {
            guard.flip()
            guard.idleFlipCooldown = Phaser.Math.RND.integerInRange(5000, 6000)
        }

        //stand still
        guard.move(0, 1, dt)
    }
}

class GuardApproachState extends State {
    enter(scene, guard) {
        guard.arm.laserEmitter.stop()
    }

    execute(scene, guard) {
        let dt = scene.game.loop.delta
        let aimAngle = -90
        guard.arm.update(dt, guard.direction, aimAngle)

        if(Math.abs(guard.x - scene.player.x) < guard.width * 12) {
            guard.xInput = 0
            if(Math.abs(guard.y - scene.player.y) < guard.width * 8) {
                guard.stateMachine.transition('aiming')
            }
        } else {
            guard.xInput = (guard.x - scene.player.x > 0) ? -1: 1
        }
        
        guard.move(1, 1, dt)
    }
}

class GuardAimingState extends State {
    enter(scene, guard) {
        guard.arm.laserEmitter.start()
        guard.aimCool = guard.aimCooldown
        if(guard.attackCount >= guard.attackClip) {
            guard.attackCount = 0
        }
    }

    execute(scene, guard) {
        let dt = scene.game.loop.delta
        //flip towards player
        let targetDirection = (guard.x - scene.player.x > 0) ? -1: 1
        if(targetDirection != guard.direction && guard.flipCool == 0) {
            guard.flip()
        }

        //back away from player
        guard.xInput = targetDirection * -1
        guard.move(0.25, 1, dt)

        let aimAngle = guard.getAimAngle(scene.player, guard.arm)
        guard.arm.update(dt, guard.direction, aimAngle)

        if(guard.aimCool == 0) {
            guard.stateMachine.transition('aimed')
        }
    }
}

class GuardAimedState extends State {
    enter(scene, guard) {
        guard.arm.laserEmitter.start()
    }

    execute(scene, guard) {
        let dt = scene.game.loop.delta
        //flip towards player
        let targetDirection = (guard.x - scene.player.x > 0) ? -1: 1
        if(targetDirection != guard.direction && guard.flipCool == 0) {
            guard.flip()
        }

        //stand still
        guard.xInput = targetDirection * -1
        guard.move(0, 1, dt)

        let aimAngle = guard.getAimAngle(scene.player, guard.arm)
        guard.arm.update(dt, guard.direction, aimAngle)

        if(guard.attackCool == 0) {
            guard.attack()
        }

        if(guard.attackCount >= guard.attackClip) {
            guard.stateMachine.transition('move')
        }

    }
}

class GuardHurtState extends State {
    enter(scene, guard) {
        guard.arm.laserEmitter.stop()
        guard.hurtCool = guard.hurtCooldown
    }

    execute(scene, guard) {
        let dt = scene.game.loop.delta
        let aimAngle = -90
        guard.arm.update(dt, guard.direction, aimAngle)

        //console.log(guard.hurtCool)
        if(guard.hurtCool == 0) {
            guard.stateMachine.transition('move')
        }
    }
}

class GuardDieState extends State {
    enter(scene, guard) {
        //console.log('die')
        //guard.arm.laserEmitter.stop()
    }

    execute(scene, guard) {
    }
}