class Attack extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, player, power, direction, id) {
        //console.log('getting scene')
        //console.log(scene)
        super(scene, x, y, 'attack')
        scene.add.existing(this);

        //add to scene
        //console.log('got scene')
        scene.physics.add.existing(this);
        //references
        //console.log('getting player')
        this.player = player
        //console.log('got player')
        this.scene = scene

        //parameters
        this.power = power
        this.id = id
        this.direction = direction
        this.lifetime = 100
        this.lived = 0

        //console.log('attack created: power, id, duration:: ' + this.power + ", " + this.id + ", " + this.lifetime)
    }

    update() {
        let dt = this.scene.game.loop.delta
        this.lived += dt
        this.x = this.player.x + (this.player.width + this.width)/2 * this.player.direction
        this.y = this.player.y
        this.body.setVelocityY(this.player.body.velocity.x, this.player.body.velocity.y)
        if(this.lived > this.lifetime) {
            this.end('idle')
        }
    }

    end(state) {
        //console.log('started end')
        this.player.state = state
        this.destroy()
        //console.log('finished end')
    }
}