class Attack extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, player, power, id) {
        super(scene, x, y, 'attack')

        //add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        //parameters
        this.player = player
        this.power = power
        this.id = id
        this.scene = scene
        this.lifetime = 100
        this.lived = 0

        //console.log('attack created')
    }

    update() {
        let dt = this.scene.game.loop.delta
        this.lived += dt
        this.x = this.player.x + (this.player.width + this.width)/2 * this.player.direction
        this.body.setVelocityX(this.player.body.velocity.x)
        if(this.lived > this.lifetime) {
            this.end('idle')
        }
    }

    end(state) {
        this.player.state = state
        this.destroy()
    }
}