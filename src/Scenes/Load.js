class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/tiled");

        // // Load tilemap information
        // this.load.image("tilemap_tiles", "tilemap_packed.png");     // Packed tilemap
        // this.load.tilemapTiledJSON("baselevel", "baselevel.tmj");   // Tilemap in JSON

        // // Load the sprite sheet for the characters (assuming 16x16 pixels per frame)
        // this.load.spritesheet("platformer_characters", "transparent_tilemap_packed.png", {
        //     frameWidth: 16,
        //     frameHeight: 16
        // });

        // this.load.multiatlas("kenny-particles", 
        //                      "kenny-particles.json");


        // // Load fonts
        // this.load.setPath('./assets/fonts');
        // this.load.bitmapFont('dritch', 'dritch.png', 'dritch.xml');


        // Load audio files
        //this.load.setPath('./assets/audio')
        //this.load.audio('<name>', '<filename>');





    }

    create() {
        // Set up animations using frame numbers
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('platformer_characters', { start: 0, end: 0 }),
            frameRate: 15,
            repeat: -1,
        });

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'platformer_characters', frame: 0 }],
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: 'platformer_characters', frame: 1 }],
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'fan',
            frames: [{ key: 'platformer_characters', frame: 0}],
            frameRate: 10,
            repeat: -1,
        });

        // Pass to the next Scene
        this.scene.start("TitleScreen");
    }
}
