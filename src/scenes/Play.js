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
        this.globalScaleFactor = 2
        const globalScaleFactor = this.globalScaleFactor
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
        
        //set up player
        this.player = new Player(this, playerSpawn.x*globalScaleFactor, playerSpawn.y*globalScaleFactor-32, 'player', null, 10, 40, 600)
        
        //set camera bounds
        this.cameras.main.setBounds(0, 0, map.widthInPixels*globalScaleFactor, map.heightInPixels*globalScaleFactor)
        this.cameras.main.startFollow(this.player, true, 0.75, 0.75, 0, 0)

        //physics groups
        //ground collision
        this.collideGroundGroup = this.add.group()
        this.collidePlatformGroup = this.add.group()

        //block entities group
        this.blockPlayerGroup = this.add.group()
        this.blockEnemyGroup = this.add.group()

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

        //entity spawning
        const objectLayer = map.getObjectLayer('Objects')
        //for each object in object layer, grab its name and spawn the corresponding entity
        for(let i = 0; i < objectLayer.objects.length; i++) {
            //console.log(objectLayer.objects[i])
            let currentObject = objectLayer.objects[i]
            switch(currentObject.name) {
                case 'enemySpawn':
                    this.spawnEnemy(currentObject.x * globalScaleFactor, currentObject.y * globalScaleFactor, currentObject.properties)
                break;
                case 'doorSpawn':
                    this.spawnDoor(currentObject.x * globalScaleFactor, currentObject.y * globalScaleFactor)
                break;
                case 'corpseSpawn':
                    this.spawnCorpse(currentObject.x * globalScaleFactor, currentObject.y * globalScaleFactor)
                break;
                default:
                    console.log(currentObject.name)
                break;
            }
        }

        //collision
        //player blocking entity collision
        this.physics.add.collider(this.player, this.blockPlayerGroup, this.handleCollision, null, this)
        //enemy blocking entity collision
        this.physics.add.collider(this.enemyGroup, this.blockEnemyGroup, this.handleCollision, null, this)
        //player and enemy ground collision
        this.collideGroundGroup.add(this.player)
        this.physics.add.collider(this.collideGroundGroup, collisionLayer, this.handleCollision, null, this)

        //player platform collision, sometimes toggled to let you drop down
        this.playerPlatformCollider = this.physics.add.collider(this.player, platformLayer, this.handleCollision, null, this)
        //enemy platform collision
        this.physics.add.collider(this.collidePlatformGroup, platformLayer, this.handleCollision, null, this)

        //enemy projectile collision
        this.physics.add.collider(this.enemyAttackGroup, collisionLayer, this.handleProjectileSolidCollision, null, this)

        //player and enemy push
        this.physics.add.overlap(this.player, this.enemyGroup, this.handleBodyOverlap, null, this)
        this.physics.add.overlap(this.enemyGroup, this.enemyGroup, this.handleBodyOverlap, null, this)
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

    spawnEnemy(x, y, properties) {
        //rebuild the array of properties and values into an object to pass to create enemy function
        let spawnProperties = {}
        for(let i = 0; i < properties.length; i++) {
            spawnProperties[properties[i].name] = properties[i].value
        }

        let enemy = new Enemy(this, x, y - 32, 'enemy', null, 7, 80, 300, spawnProperties)
        //tell game enemy goes in collection of things that stand on ground and platforms
        this.collideGroundGroup.add(enemy)
        this.collidePlatformGroup.add(enemy)
        //add to enemy collision group for hit detection 
        this.enemyGroup.add(enemy)
        //add to enemy sight group for spotted detection
        this.enemySightGroup.add(enemy.sightBox)
    }

    spawnDoor(x, y) {
        let door = new BreakableDoor(this, x, y - 24*this.globalScaleFactor, 'breakableDoor', null, 7).setScale(this.globalScaleFactor)
        //add door to blocking group
        this.blockPlayerGroup.add(door)
        this.blockEnemyGroup.add(door)
        //add door to enemy group so you can stab it
        this.enemyGroup.add(door)
    }

    spawnCorpse(x, y) {
        let corpse = new Corpse(this, x, y - 16*this.globalScaleFactor, 'corpse', null, 4).setScale(this.globalScaleFactor)
        //tell game enemy goes in collection of things that stand on ground and platforms
        this.collideGroundGroup.add(corpse)
        this.collidePlatformGroup.add(corpse)
        //add corpse to enemy group so you can stab it
        this.enemyGroup.add(corpse)
    }

    handleCollision() {
        //collision does not let things overlap, could be used for running into a shield?
        //console.log('collide')
    }

    handleProjectileSolidCollision(projectile, ground) {
        projectile.destroy()
    }

    handleBodyOverlap(player, enemy) {
        let dt = this.game.loop.delta
        let xDifference = player.x - enemy.x
        let pushDir = (xDifference > 0) ? 1: -1
        //how deep into the enemy is the edge of the player?
        let overlapAmount = Math.max(-1, 0.5 - (Math.abs(xDifference) - player.width * player.scale/2) / (enemy.width * enemy.scale))

        //enemy pushes player
        let pushForce = enemy.pushForce
        let pushSpeed = enemy.pushSpeed
        player.approachVelocity('x', pushSpeed * pushDir, pushForce * overlapAmount * dt)

        //player pushes enemy
        pushForce = player.pushForce
        pushSpeed = player.pushSpeed
        enemy.approachVelocity('x', pushSpeed * -pushDir, pushForce * overlapAmount * dt)
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
            if(enemy.stateMachine) {
                enemy.stateMachine.transition('hurt')
            }
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