class Play extends Phaser.Scene {
    constructor() {
        super('playScene')
        //console.log('TestScene: constructor')
    }

    init() {

    }

    preload() {
    }

    create() {
        //scaling factor
        const globalScaleFactor = 2
        //tilemap setup
        const map = this.add.tilemap('tilemapJSON1')
        //thirteenTile is the tileset's name in tiled
        const tileset = map.addTilesetImage('thirteenTile', 'tilemapImage')
        //BlockCollide is the name of the layer in tiled
        const backgroundLayer = map.createLayer('Background', 'thirteenTile', 0, 0).setScale(globalScaleFactor)
        const collisionLayer = map.createLayer('BlockCollide', 'thirteenTile', 0, 0).setScale(globalScaleFactor)
        const platformLayer = map.createLayer('Platforms', 'thirteenTile', 0, 0).setScale(globalScaleFactor)
        collisionLayer.setCollisionByExclusion([-1])
        platformLayer.setCollisionByExclusion([-1])
        //from: https://cedarcantab.wixsite.com/website-1/post/one-way-pass-through-platforms-in-phaser-3-tile-maps
        platformLayer.forEachTile(tile => {
            if (tile.properties["platform"]) {
              tile.setCollision(false, false, true, false);
            }
        })

        //stop tunnelling
        //original value was 16
        this.physics.world.TILE_BIAS = 15 * globalScaleFactor

        //get player spawn
        const playerSpawn = map.findObject('Objects', (obj) => obj.name === 'playerSpawn')

        //set world bounds
        this.physics.world.setBounds(0, 0, map.widthInPixels*globalScaleFactor, map.heightInPixels*globalScaleFactor)

        //keys
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        keyJUMP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        keyCROUCH = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
        keyATTACK = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J)
        keyDODGE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K)

        //temporary floor
        //let floor = this.add.rectangle(game.config.width/2, game.config.height*2/3, game.config.width * 4, game.config.height/3, 0xffffff).setOrigin(0.5, 0)
        //this.physics.add.existing(floor)
        //floor.body.setImmovable(true)

        //set up enemy
        let enemy = new Enemy(this, game.config.width*10/20, game.config.height/2, 'enemy', null, 7, 80, 300)
        //set up player
        this.player = new Player(this, playerSpawn.x*globalScaleFactor, (playerSpawn.y-8*4)*globalScaleFactor, 'player', null, 10, 40, 600)
        
        //set camera bounds
        this.cameras.main.setBounds(0, 0, map.widthInPixels*globalScaleFactor, map.heightInPixels*globalScaleFactor)
        this.cameras.main.startFollow(this.player, true, 0.75, 0.75)

        //physics groups
        //ground collision
        this.collideGroundGroup = this.add.group()
        this.collideGroundGroup.add(this.player)
        this.collideGroundGroup.add(enemy)
        this.collidePlatformGroup = this.add.group()
        //this.collidePlatformGroup.add(this.player)
        this.collidePlatformGroup.add(enemy)

        this.playerAttackGroup = this.add.group({
            runChildUpdate: true
        })
        this.enemyGroup = this.add.group({
            runChildUpdate: true
        })
        this.enemyAttackGroup = this.add.group({
            runChildUpdate: true
        })
        //enemy sight boxes
        this.enemySightGroup = this.add.group()

        //collision
        this.physics.add.collider(this.collideGroundGroup, collisionLayer, this.handleCollision, null, this)
        this.physics.add.collider(this.collidePlatformGroup, platformLayer, this.handleCollision, null, this)
        this.playerPlatformCollider = this.physics.add.collider(this.player, platformLayer, this.handleCollision, null, this)

        //overlap
        this.enemyGroup.add(enemy)
        this.enemySightGroup.add(enemy.sightBox)

        //player and enemy push
        this.physics.add.overlap(this.player, this.enemyGroup, this.handleBodyOverlap, null, this)
        //spot player
        this.physics.add.overlap(this.player, this.enemySightGroup, this.handleSeenOverlap, null, this)
        //hit player
        this.physics.add.overlap(this.enemyAttackGroup, this.player, this.handleEnemyAttackOverlap, null, this)
        //hit enemy
        this.physics.add.overlap(this.playerAttackGroup, this.enemyGroup, this.handleAttackOverlap, null, this)
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

    handleSeenOverlap(player, sightBox) {
        if(sightBox.owner.stateMachine.state == 'idle') {
            sightBox.owner.stateMachine.transition('move')
        }
    }

    handleAttackOverlap(attack, enemy) {
        if(enemy.rememberedHits.has(attack.id)) {
            //skip this hit
        } else {
            //new hit, take the damage
            enemy.approachVelocity('x', 1500 * attack.direction, 1000)
            enemy.approachVelocity('y', -1500, 400)
            enemy.stateMachine.transition('hurt')
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