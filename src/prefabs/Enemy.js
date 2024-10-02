class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)
        //add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        //set up parameters
        this.moveSpeed = 1
        console.log('created enemy')
        console.log(texture)
    }
}