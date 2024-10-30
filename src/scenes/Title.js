class Title extends Phaser.Scene {
    //functions happen in order

    //happens when the scene is instantiated at the start
    constructor() {
        super('titleScene')
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
        this.add.bitmapText(game.config.width/2, game.config.height*2/6 - 64, 'pixelU', 'CUT AWAY', 64).setOrigin(.5)
        this.add.image(game.config.width*0.5, game.config.height*0.625, 'titleSplash').setOrigin(0.5).setScale(4)

        const menuTextOffset = {x: 1/6, y: 6/8}

        const leftText = 'Press [A] for tutorial'
        this.add.bitmapText(game.config.width * menuTextOffset.x, game.config.height * menuTextOffset.y - 32, 'pixelU', leftText, 32).setOrigin(.5).setMaxWidth(game.config.width/4)
        const rightText = 'Press [D] to escape'
        this.add.bitmapText(game.config.width * (1 - menuTextOffset.x), game.config.height * menuTextOffset.y - 32, 'pixelU', rightText, 32).setOrigin(.5).setMaxWidth(game.config.width/4)
        
        //define keys
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }

    //do constantly
    update() {
        //automatically fed time and delta
        if(Phaser.Input.Keyboard.JustDown(keyRIGHT)){
            this.scene.start('playScene')
        }
        if(Phaser.Input.Keyboard.JustDown(keyLEFT)){
            this.scene.start('tutorialScene')
        }
    }

    
}