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

        //defensive mode
        this.defenceOption = 'dodge'

        //initial defence params
        this.defenceCooldown = 500
        this.defenceDuration = 50

        //initial attack parameters
        this.attackCooldown = 300
        this.attackPower = 3
    }

    update(dt) {
        //cooldown defensive ability
        this.defenceCool = Math.max(0, this.defenceCool - dt)
        //cooldown attack
        this.attackCool = Math.max(0, this.attackCool - dt)

        //still modifier lowers the force applied when not actively moving, can be overridden to act as a force mult: ex: for a strong dash
        let stillModifier = (this.xInput == 0) ? 0.5: 1
        let flipped = false

        switch(this.state) { //this part is placeholder for preventing movement while attacking
            case 'idle':
                this.xInput = -keyLEFT.isDown + keyRIGHT.isDown
                this.targetVelocity = this.xInput * this.moveSpeed
        
                flipped = (this.direction == 1) ? false: true
                this.setFlipX(flipped)
                
                if(Phaser.Input.Keyboard.JustDown(keyDODGE) && this.defenceCool == 0) {
                    this.state = this.defenceOption
                    this.defenceCool = this.defenceCooldown
                } else if(Phaser.Input.Keyboard.JustDown(keyATTACK) && this.attackCool == 0) {
                    this.state = 'attack'
                    this.spawnMeleeAttack(this.attackPower, this.attackId)
                    this.attackCool = this.attackCooldown
                }
            break;
            
            case 'attack':
                this.xInput = 0
                this.targetVelocity = this.direction * this.moveSpeed * 0.0
            break;

            case 'dodge':
                this.targetVelocity = this.direction * this.moveSpeed * 2
                stillModifier = 8
                this.xInput = 0
        
                flipped = (this.direction == 1) ? false: true
                this.setFlipX(flipped)

                if(this.defenceCooldown - this.defenceCool > this.defenceDuration) {
                    this.state = 'idle'
                }
            break;
        }
        
        let force = this.moveForceX * stillModifier * dt
        //console.log('going')
        this.approachVelocity('x', this.targetVelocity, force)
        //sconsole.log('gone')

        this.direction = (this.xInput == 0) ? this.direction: this.xInput
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
        super.die()
    }
}