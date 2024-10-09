class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)
        //add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //set up parameters
        this.moveSpeed = 1000
        this.moveForceX = 10
        this.xInput = 0
        this.targetVelocity = 0

        //collision parameters
        this.pushForce = 40
        this.pushSpeed = 600

        //state and facing direction
        this.direction = 1
        this.state = 'idle'
        this.scene = scene

        //defensive mode
        this.defenceOption = 'dodge'

        //initial defence params
        this.dodgeDistance = 100
        this.defenceCooldown = 500
        this.defenceCool = 0
        this.defenceDuration = 50

        //initial attack parameters
        this.attackId = 0
        this.attackCooldown = 300
        this.attackCool = 0
        this.attackPower = 3

        console.log('created player')
        console.log(texture)
    }

    update(dt) {
        //cooldown defensive ability
        this.defenceCool = Math.max(0, this.defenceCool - dt)
        //cooldown attack
        this.attackCool = Math.max(0, this.attackCool - dt)
        //console.log(this.defenceCool)

        //still modifier lowers the force applied when not actively moving, can be overridden to act as a force mult: ex: for a strong dash
        let stillModifier = (this.xInput == 0) ? 0.5: 1

        switch(this.state) { //this part is placeholder for preventing movement while attacking
            case 'idle':
                this.xInput = -keyLEFT.isDown + keyRIGHT.isDown
                this.targetVelocity = this.xInput * this.moveSpeed
                if(Phaser.Input.Keyboard.JustDown(keyDODGE) && this.defenceCool == 0) {
                    this.state = this.defenceOption
                    this.defenceCool = this.defenceCooldown
                } else if(Phaser.Input.Keyboard.JustDown(keyATTACK) && this.attackCool == 0) {
                    this.state = 'attack'
                    this.attack(this.attackPower, this.attackId)
                    this.attackCool = this.attackCooldown
                }
            break;
            
            case 'attack':
                this.xInput = 0
                this.targetVelocity = this.direction * this.moveSpeed * 0.0
                //this.state = 'idle'
            break;

            case 'dodge':
                this.targetVelocity = this.direction * this.moveSpeed * 2
                stillModifier = 8
                this.xInput = 0
                if(this.defenceCooldown - this.defenceCool > this.defenceDuration) {
                    this.state = 'idle'
                }
            break;
        }
        let finalVelocity = Math.max(this.body.velocity.x - this.moveForceX * stillModifier * dt, Math.min(this.targetVelocity, this.body.velocity.x + this.moveForceX * stillModifier * dt))
        this.body.setVelocityX(finalVelocity)
        this.direction = (this.xInput == 0) ? this.direction: this.xInput
    }

    attack(power, attackId) {
        let attack = new Attack(this.scene, this.x + this.width * this.direction, this.y, this, 3, this.attackId)
        this.scene.playerAttackGroup.add(attack)
        this.attackId += 1
        //console.log('attacked')
    }
}