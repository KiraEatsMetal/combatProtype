class ProjectileBase extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, owner, power, speed, angle, id) {
        super(scene, x, y, texture, frame)

        //add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        //references
        this.owner = owner
        this.scene = scene

        this.scene.enemyAttackGroup.add(this)

        //parameters
        this.power = power
        this.id = id
        this.lifetime = 10000
        this.lived = 0

        this.body.setVelocityX(speed * angle)
    }

    update() {
        let dt = this.scene.game.loop.delta
        this.lived += dt
        if(this.lived > this.lifetime) {
            this.destroy()
        }
    }
}