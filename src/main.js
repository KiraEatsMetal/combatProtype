/*
Contributors: Kira Way
Project: Combat Prototype
*/

let config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    render: {
        pixelArt:true,
    },
    physics:{
        default: 'arcade',
        arcade: {
            //debug: true
        }
    },
    scene: [Play]
}

let game = new Phaser.Game(config);

//define keys
let keyLEFT, keyRIGHT, keyJUMP, keyCROUCH, keyATTACK, keyDODGE