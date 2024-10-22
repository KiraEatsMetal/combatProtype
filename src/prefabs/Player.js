class Player extends BaseEntity {
    constructor(scene, x, y, texture, frame, health, pushForce = 0, pushSpeed = 0) {
        super(scene, x, y, texture, frame, health, pushForce, pushSpeed)
        
        //universal defence parameters
        this.defenceCool = 0

        //universal attack parameters
        this.attackId = 0
        this.attackCool = 0
        
        /*
        CONFIGURABLE/CHANGABLE PARAMS BELOW, UNIVERSAL PARAMS ABOVE
        */

        //initial movement parameters
        this.moveSpeed = 1000
        this.moveForceX = 10
        this.jumpForce = 2000

        //defensive mode
        this.defenceOption = 'dodge'

        //initial defence params
        this.defenceCooldown = 500
        this.defenceDuration = 50

        //initial attack parameters
        this.attackCooldown = 300
        this.attackPower = 3

        //state machine
        this.stateMachine = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            jump: new JumpState(),
            attack: new AttackState(),
            defend: new DefendState(),
            die: new DieState()
        }, [this.scene, this])
    }

    update(dt) {

        //still modifier lowers the force applied when not actively moving, can be overridden to act as a force mult: ex: for a strong dash
        //let flipped = false

        this.stateMachine.step()
        this.cooldown(dt)
    }

    spawnMeleeAttack(power, attackId) {
        //console.log('spawning melee attack')
        if(this.scene){
            this.attack = new Attack(this.scene, this.x + this.width * this.direction, this.y, this, 3, this.direction, this.attackId)
            //console.log('spawned melee attack')
            this.scene.playerAttackGroup.add(this.attack)
            this.attackId += 1
        }
    }

    stopMeleeAttack() {
        if(this.attack) {
            this.attack.destroy()
        }
    }
    
    die(){
        this.stopMeleeAttack()
        this.stateMachine.transition('die');
        super.die()
    }

    jump() {
        this.approachVelocity('y', -1100, this.jumpForce)
    }

    move(control, speedModifier, forceModifier, dt) {
        //get player x inputs, set target speed
        if(control) {
            this.xInput = -keyLEFT.isDown + keyRIGHT.isDown
        } else {
            this.xInput = this.direction
        }
        this.targetVelocity = this.xInput * this.moveSpeed * speedModifier
        
        let force = this.moveForceX * forceModifier * dt
        this.approachVelocity('x', this.targetVelocity, force)
        this.direction = (this.xInput == 0) ? this.direction: this.xInput

        let flipped = (this.direction == 1) ? false: true
        this.setFlipX(flipped)
    }

    cooldown(dt) {
        //cooldown defensive ability
        this.defenceCool = Math.max(0, this.defenceCool - dt)
        
        //cooldown attack
        this.attackCool = Math.max(0, this.attackCool - dt)
    }
}

class IdleState extends State {
    enter(scene, player) {

    }

    execute(scene, player) {
        let dt = scene.game.loop.delta
        player.move(true, 1, 0.5, dt)

        //transition to move
        if(player.xInput != 0) {
            player.stateMachine.transition('move')
        }
        //transition to jump
        if(Phaser.Input.Keyboard.JustDown(keyJUMP) && player.body.touching.down) {
            player.stateMachine.transition('jump');
        }

        //transition to defence
        if(Phaser.Input.Keyboard.JustDown(keyDODGE) && player.defenceCool == 0) {
            player.stateMachine.transition('defend');
        }
        //transition to attack
        if(Phaser.Input.Keyboard.JustDown(keyATTACK) && player.attackCool == 0) {
            player.stateMachine.transition('attack');
        }
    }
}

class MoveState extends State {
    enter(scene, player) {

    }

    execute(scene, player) {
        let dt = scene.game.loop.delta
        player.move(true, 1, 1, dt)

        //transition to jump
        if(Phaser.Input.Keyboard.JustDown(keyJUMP) && player.body.touching.down) {
            player.stateMachine.transition('jump');
        }

        //transition to defence
        if(Phaser.Input.Keyboard.JustDown(keyDODGE) && player.defenceCool == 0) {
            player.stateMachine.transition('defend');
        }
        //transition to attack
        if(Phaser.Input.Keyboard.JustDown(keyATTACK) && player.attackCool == 0) {
            player.stateMachine.transition('attack');
        }
        
        //transition to idle
        if(player.xInput == 0) {
            player.stateMachine.transition('idle');
        }
    }
}

class JumpState extends State {
    enter(scene, player) {
        player.jump()
    }

    execute(scene, player) {
        let dt = scene.game.loop.delta
        player.move(true, 1, 0.5, dt)

        //transition to defence
        if(Phaser.Input.Keyboard.JustDown(keyDODGE) && player.defenceCool == 0) {
            player.stateMachine.transition('defend');
        }
        //transition to attack
        if(Phaser.Input.Keyboard.JustDown(keyATTACK) && player.attackCool == 0) {
            player.stateMachine.transition('attack');
        }
        
        //transition to idle
        if(true) {
            player.stateMachine.transition('idle');
        }   
    }
}

class AttackState extends State {
    enter(scene, player) {
        player.spawnMeleeAttack(player.attackPower, player.attackId)
        player.attackCool = player.attackCooldown
    }

    execute(scene, player) {
        let dt = scene.game.loop.delta
        player.move(false, 0.5, 1, dt)

        if(player.attackCool == 0) {
            player.stateMachine.transition('idle')
        }
    }
}

class DefendState extends State {
    enter(scene, player) {
        player.defenceCool = player.defenceCooldown
    }

    execute(scene, player) {
        let dt = scene.game.loop.delta
        player.move(false, 2, 8, dt)

        let flipped = (player.direction == 1) ? false: true
        player.setFlipX(flipped)

        if(player.defenceCooldown - player.defenceCool > player.defenceDuration) {
            player.stateMachine.transition('idle');
        }        
    }
}

class DieState extends State {
    enter(scene, player) {

    }

    execute(scene, player) {

    }
}