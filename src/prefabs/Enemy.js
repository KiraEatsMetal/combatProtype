class Enemy extends BaseEntity {
    constructor(scene, x, y, texture, frame, health, pushForce = 0, pushSpeed = 0) {
        super(scene, x, y, texture, frame, health, pushForce, pushSpeed)
        this.arm = new Arm(scene, this, this.width/4, -this.height/4, 'arm', this.direction, [0, 0], this.width * 8, 'laserParticle')

        this.scene.time.delayedCall(1000, this.attack, null, this)


        //state machine
        this.stateMachine = new StateMachine('idle', {
            idle: new GuardIdleState(),
            move: new GuardMoveState(),
            jump: new GuardJumpState(),
            aiming: new GuardAimingState(),
            aimed: new GuardAimedState(),
            hurt: new GuardHurtState(),
            die: new GuardDieState()
        }, [this.scene, this])
    }

    update() {
        let targetDirection = (this.x - this.scene.player.x > 0) ? -1: 1
        if(targetDirection != this.direction) {
            this.flip()
        }
        //console.log(this.direction)

        let dt = this.scene.game.loop.delta
        let aimAngle = this.getAimAngle(this.scene.player, this.arm)
        //aimAngle = (this.direction == 1) ? aimAngle: -aimAngle
        this.arm.update(dt, this.direction, aimAngle)

        super.update()
    }

    die(){
        this.arm.destroy()
        super.die()
    }

    attack() {
        let aimAngle = (this.arm.flipX) ? 180-this.arm.angle: -this.arm.angle
        new ProjectileBase(this.scene, this.arm.x, this.arm.y, 'bullet', null, this, 3, 2000, aimAngle, Phaser.Math.RND.integerInRange(0, 255))
        this.scene.time.delayedCall(3000, this.attack, null, this)
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
    }
}

class GuardIdleState extends State {
    enter(scene, guard) {

    }

    execute(scene, guard) {

    }
}

class GuardMoveState extends State {
    enter(scene, guard) {

    }

    execute(scene, guard) {

    }
}

class GuardJumpState extends State {
    enter(scene, guard) {

    }

    execute(scene, guard) {

    }
}

class GuardAimingState extends State {
    enter(scene, guard) {

    }

    execute(scene, guard) {

    }
}

class GuardAimedState extends State {
    enter(scene, guard) {

    }

    execute(scene, guard) {

    }
}

class GuardHurtState extends State {
    enter(scene, guard) {

    }

    execute(scene, guard) {

    }
}

class GuardDieState extends State {
    enter(scene, guard) {

    }

    execute(scene, guard) {

    }
}