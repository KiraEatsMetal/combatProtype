class Tutorial extends Phaser.Scene {
    //functions happen in order

    //happens when the scene is instantiated at the start
    constructor() {
        super('tutorialScene')
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
        //titles
        this.add.bitmapText(game.config.width*1/4, game.config.height*2/6 - 64, 'pixelU', 'RUN', 64).setOrigin(.5)
        this.add.bitmapText(game.config.width*1/2, game.config.height*2/6 - 64, 'pixelU', 'vs', 64).setOrigin(.5)
        this.add.bitmapText(game.config.width*3/4, game.config.height*2/6 - 64, 'pixelU', 'FIGHT', 64).setOrigin(.5)
        //instruction
        //run
        const runText = 'Use [A] and [D] to move left and right. Press [SPACE] to jump, and hold [S] when jumping or falling to drop through platforms.'
        this.add.bitmapText(game.config.width*1/4, game.config.height*2/6 + 32*1, 'pixelU', runText, 32).setOrigin(.5, 0).setMaxWidth(game.config.width/3)
        //fight
        const fightText = "Use [J] to attack and [K] to dash. Pay attention to what direction an enemy is looking and don't get shot. Eat corpses to heal."
        this.add.bitmapText(game.config.width*3/4, game.config.height*2/6 + 32*1, 'pixelU', fightText, 32).setOrigin(.5, 0).setMaxWidth(game.config.width/3)
        //fight
        const returnText = "Press [D] to return to title"
        this.add.bitmapText(game.config.width/2, game.config.height*5/6 + 32*1, 'pixelU', returnText, 32).setOrigin(.5, 0)

        //define keys
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    }

    //do constantly
    update() {
        //automatically fed time and delta
        if(Phaser.Input.Keyboard.JustDown(keyRIGHT)){
            this.scene.start('titleScene')
        }
    }

    
}