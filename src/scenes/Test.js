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
        this.enemy = new Enemy(this, game.config.width*19/20, game.config.height/2, 'enemy').setOrigin(0.5, 0.5)

    }

    update(timestep, dt) {
        this.player.update(dt)
    }
}