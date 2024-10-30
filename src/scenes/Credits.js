class Credits extends Phaser.Scene {
    //functions happen in order

    //happens when the scene is instantiated at the start
    constructor() {
        super('creditsScene')
    }

    //happens once every time the scene is restarted/added
    init() {
        //can recieve data
    }

    //load assets
    preload() {

    }

    //make things
    create() {
        //can recieve data
        //text
        //title
        this.add.bitmapText(game.config.width*0.5, game.config.height*1/6, 'pixelU', 'CREDITS', 64).setOrigin(.5)
        this.add.bitmapText(game.config.width/2, game.config.height*2/6, 'pixelU', 'Code, art: Kira Way', 32).setOrigin(.5)
        this.add.bitmapText(game.config.width/2, game.config.height*2/6 + 32, 'pixelU', '', 32).setOrigin(.5)
        this.add.bitmapText(game.config.width/2, game.config.height*2/6 + 64, 'pixelU', '', 32).setOrigin(.5)
        this.add.bitmapText(game.config.width/2, game.config.height*2/6 + 128, 'pixelU', 'Special thanks to my parents,', 32).setOrigin(.5)
        this.add.bitmapText(game.config.width/2, game.config.height*2/6 + 160, 'pixelU', 'teachers, and Ellie for support', 32).setOrigin(.5)
        this.add.bitmapText(game.config.width*1/2, game.config.height*5/6 + 32, 'pixelU', 'Press [A] to go to title', 32).setOrigin(.5)

        //define keys
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    }

    //do constantly
    update() {
        //automatically fed time and delta
        if(Phaser.Input.Keyboard.JustDown(keyLEFT)){
            this.scene.start('titleScene')
        }
    }

    
}