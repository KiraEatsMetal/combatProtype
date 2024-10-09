class Play extends Phaser.Scene {
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
        this.load.image('attack', './assets/attack.png')
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
        let enemy = new Enemy(this, game.config.width*10/20, game.config.height/2, 'enemy', null, 7, 80, 300).setOrigin(0.5, 0.5)

        //collision

        //overlap
        this.playerAttackGroup = this.add.group({
            runChildUpdate: true
        })
        this.enemyGroup = this.add.group({
            runChildUpdate: true
        })

        this.enemyGroup.add(enemy)

        this.physics.add.overlap(this.player, this.enemyGroup, this.handleBodyOverlap, null, this)
        this.physics.add.overlap(this.playerAttackGroup, this.enemyGroup, this.handleAttackOverlap, null, this)

        //debug
        console.log(this)
        console.log(this.game.loop.delta)
    }

    update(timestep, dt) {
        this.player.update(dt)
    }

    handleCollision() {
        console.log('collide')
    }

    handleBodyOverlap(player, enemy) {
        //console.log('overlap')
        let dt = this.game.loop.delta
        let xDifference = player.x - enemy.x
        let pushDir = Math.abs(xDifference) / xDifference
        //how deep into the enemy is the edge of the player?
        let overlapAmount = Math.max(-1, 0.5 - (Math.abs(xDifference) - player.width/2) / (enemy.width))
        //overlapAmount = overlapAmount ** 1
        //console.log(overlapAmount)

        //enemy pushes player
        let pushForce = enemy.pushForce
        let pushSpeed = enemy.pushSpeed
        let finalVelocity = Math.max(player.body.velocity.x - pushForce * overlapAmount * dt, Math.min(pushSpeed * pushDir, player.body.velocity.x + pushForce * overlapAmount * dt))
        player.body.setVelocityX(finalVelocity)

        //player pushes enemy
        pushForce = player.pushForce
        pushSpeed = player.pushSpeed
        finalVelocity = Math.max(enemy.body.velocity.x - pushForce * overlapAmount * dt, Math.min(pushSpeed * -pushDir, enemy.body.velocity.x + pushForce * overlapAmount * dt))
        enemy.body.setVelocityX(finalVelocity)
    }

    handleAttackOverlap(attack, enemy) {
        //console.log(enemy)
        //console.log(attack)
        if(enemy.rememberedHits.has(attack.id)) {
            console.log('skipping hit')
        } else {
            enemy.currentHealth -= attack.power
            enemy.rememberedHits.add(attack.id)
            console.log('new hit')
        }
    }
}