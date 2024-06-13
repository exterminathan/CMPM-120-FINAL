class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/tiled");

        // // Load tilemap information
        this.load.image("tilemap_tiles", "tilesheet_complete.png");     // Packed tilemap
        this.load.tilemapTiledJSON("level1", "levelone.tmj");   // Tilemap in JSON

        // Load the sprite sheet for the characters (assuming 16x16 pixels per frame)
        this.load.spritesheet("characters", "spritesheet_default.png", {
            frameWidth: 64,
            frameHeight: 64
        });


        this.load.image('apple', 'apple.png');
        this.load.image('candy', 'candy.png');
        this.load.image('meat', 'meat.png');

        
        this.load.image('sword', 'sword.png');
        this.load.image('pike', 'pike.png');
        this.load.image('spear', 'spear.png');




        // // Load fonts
        this.load.setPath('./assets/fonts');
        this.load.bitmapFont('dritch', 'dritch_0.png', 'dritch.xml');


        // Load audio files
        //this.load.setPath('./assets/audio')
        //this.load.audio('<name>', '<filename>');

    }

    create() {
        // player animations
        this.anims.create({
            key: 'player-walk',
            frames: [{ key: 'characters', frame: 53 }],
            frameRate: 10,
            repeat: -1,
        });


        this.anims.create({
            key: 'player-idle',
            frames: [{ key: 'characters', frame: 9 }],
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'player-jump',
            frames: [{ key: 'characters', frame: 9 }],
            frameRate: 10,
            repeat: -1,
        });


        // purple enemy animations
        this.anims.create({
            key: 'purple-walk',
            frames: [{ key: 'characters', frame: 75 }],
            frameRate: 10,
            repeat: -1,
        });


        this.anims.create({
            key: 'purple-idle',
            frames: [{ key: 'characters', frame: 31 }],
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'purple-jump',
            frames: [{ key: 'characters', frame: 31 }],
            frameRate: 10,
            repeat: -1,
        });

        // red enemy animations
        this.anims.create({
            key: 'red-walk',
            frames: [{ key: 'characters', frame: 64 }],
            frameRate: 10,
            repeat: -1,
        });


        this.anims.create({
            key: 'red-idle',
            frames: [{ key: 'characters', frame: 20 }],
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'red-jump',
            frames: [{ key: 'characters', frame: 20 }],
            frameRate: 10,
            repeat: -1,
        });

        // green enemy animations
        this.anims.create({
            key: 'green-walk',
            frames: [{ key: 'characters', frame: 86 }],
            frameRate: 10,
            repeat: -1,
        });


        this.anims.create({
            key: 'green-idle',
            frames: [{ key: 'characters', frame: 42 }],
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: 'green-jump',
            frames: [{ key: 'characters', frame: 42 }],
            frameRate: 10,
            repeat: -1,
        });

        //door
        this.anims.create({
            key: 'door',
            frames: [{ key: 'characters', frame: 74 }],
            frameRate: 10,
            repeat: -1,
        });

        
        // Pass to the next Scene
        this.scene.start("platformerScene"); //TitleScreen
    }
}
