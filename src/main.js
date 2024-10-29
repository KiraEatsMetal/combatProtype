/*
Contributors: Kira Way
Project: Combat Prototype
*/

let config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 512,
    render: {
        pixelArt:true,
    },
    physics:{
        default: 'arcade',
        arcade: {
            //debug: true
        }
    },
    scene: [Load, Title, Tutorial, Play, Credits]
}

let game = new Phaser.Game(config);

//define keys
let keyLEFT, keyRIGHT, keyJUMP, keyCROUCH, keyATTACK, keyDODGE, keyMORPH