class Play extends Phaser.Scene {
    constructor() {
        super('testScene')
        //console.log('TestScene: constructor')
    }

    init() {

    }

    preload() {
        //load images
        this.load.image('player', './assets/player.png')
        this.load.image('enemy', './assets/enemy.png')
        this.load.image('attack', './assets/attack.png')
        this.load.image('arm', './assets/arm.png')
        this.load.image('bullet', './assets/bullet.png')
        this.load.image('laserParticle', './assets/laserParticle.png')
    }

    create() {
        //keys
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        keyJUMP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
        keyCROUCH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        keyATTACK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)
        keyDODGE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)

        //temporary floor
        let floor = this.add.rectangle(game.config.width/2, game.config.height*2/3, game.config.width * 2, game.config.height/3, 0xffffff).setOrigin(0.5, 0)
        this.physics.add.existing(floor)
        floor.body.setImmovable(true)

        //set up enemy
        let enemy = new Enemy(this, game.config.width*10/20, game.config.height/2, 'enemy', null, 7, 80, 300)
        //set up player
        this.player = new Player(this, game.config.width/20, game.config.height/2, 'player', null, 10, 40, 600)

        //collision
        this.collideGroundGroup = this.add.group()
        this.collideGroundGroup.add(this.player)
        this.collideGroundGroup.add(enemy)

        this.physics.add.collider(this.collideGroundGroup, floor, this.handleCollision, null, this)

        //overlap
        this.playerAttackGroup = this.add.group({
            runChildUpdate: true
        })
        this.enemyGroup = this.add.group({
            runChildUpdate: true
        })
        this.enemyAttackGroup = this.add.group({
            runChildUpdate: true
        })

        this.enemyGroup.add(enemy)

        this.physics.add.overlap(this.player, this.enemyGroup, this.handleBodyOverlap, null, this)
        this.physics.add.overlap(this.enemyAttackGroup, this.player, this.handleEnemyAttackOverlap, null, this)
        this.physics.add.overlap(this.playerAttackGroup, this.enemyGroup, this.handleAttackOverlap, null, this)

        //debug
        //console.log(this)
        //console.log(this.game.loop.delta)
    }

    update(timestep, dt) {
        this.player.update(dt)
    }

    handleCollision() {
        //collision does not let things overlap, could be used for running into a shield?
        //console.log('collide')
    }

    handleBodyOverlap(player, enemy) {
        let dt = this.game.loop.delta
        let xDifference = player.x - enemy.x
        let pushDir = Math.abs(xDifference) / xDifference
        //how deep into the enemy is the edge of the player?
        let overlapAmount = Math.max(-1, 0.5 - (Math.abs(xDifference) - player.width/2) / (enemy.width))

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
        if(enemy.rememberedHits.has(attack.id)) {
            //skip this hit
        } else {
            //new hit, take the damage
            enemy.approachVelocity('x', 1500 * attack.direction, 1000)
            enemy.approachVelocity('y', -1500, 400)
            enemy.changeHealth(-attack.power)
            enemy.rememberedHits.add(attack.id)
        }
    }

    handleEnemyAttackOverlap(attack, player) {
        if(player.rememberedHits.has(attack.id)) {
            //skip this hit
            //console.log('player hit skipped')
        } else {
            //new hit, take the damage
            let direction = (attack.x > player.x) ? -1: 1
            player.approachVelocity('x', 1500 * direction, 1000)
            player.changeHealth(-attack.power)
            player.rememberedHits.add(attack.id)
        }
    }
}