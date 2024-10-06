class Test extends Phaser.Scene {
    constructor() {
        super('testScene')
        console.log('TestScene: constructor')
    }

    init() {

    }

    preload() {
        //load images
        this.load.image('player', './assets/player.png')
        this.load.image('enemy', './assets/enemy.png')
    }

    create() {
        //keys
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        keyATTACK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)
        keyDODGE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)

        //set up player
        this.player = new Player(this, game.config.width/20, game.config.height/2, 'player').setOrigin(0.5, 0.5)
        //set up enemy
        this.enemy = new Enemy(this, game.config.width*10/20, game.config.height/2, 'enemy', null, 80, 300).setOrigin(0.5, 0.5)

        //collision
        this.physics.add.overlap(this.player, this.enemy, this.handleOverlap, null, this)
        console.log(this)
        console.log(this.game.loop.delta)
    }

    update(timestep, dt) {
        this.player.update(dt)
        this.enemy.update(dt)
    }

    handleCollision() {
        console.log('collide')
    }

    handleOverlap(player, enemy) {
        console.log('overlap')
        let dt = this.game.loop.delta
        let xDifference = player.x - enemy.x
        let pushDir = Math.abs(xDifference) / xDifference
        let overlapAmount = Math.max(-1, 0.5 - (Math.abs(xDifference) - player.width/2) / (enemy.width))
        overlapAmount = overlapAmount ** 1
        console.log(overlapAmount)

        let pushForce = enemy.pushForce
        let pushSpeed = enemy.pushSpeed
        let finalVelocity = Math.max(player.body.velocity.x - pushForce * overlapAmount * dt, Math.min(pushSpeed * pushDir, player.body.velocity.x + pushForce * overlapAmount * dt))
        player.body.setVelocityX(finalVelocity)

        pushForce = player.pushForce
        pushSpeed = player.pushSpeed
        finalVelocity = Math.max(enemy.body.velocity.x - pushForce * overlapAmount * dt, Math.min(pushSpeed * -pushDir, enemy.body.velocity.x + pushForce * overlapAmount * dt))
        enemy.body.setVelocityX(finalVelocity)
    }
}