class Inventory {
    constructor() {
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
        console.log(`Added ${item.name} to inventory`);
    }

    removeItem(itemName) {
        this.items = this.items.filter(item => item.name !== itemName);
        console.log(`Removed ${itemName} from inventory`);
    }

    useItem(itemName, player) {
        const itemIndex = this.items.findIndex(item => item.name === itemName);
        if (itemIndex !== -1) {
            const item = this.items[itemIndex];
            console.log(item);
            item.use(player);
            this.items.splice(itemIndex, 1);
        } else {
            console.log(`Item ${itemName} not found in inventory`);
        }
    }

    hasItem(itemName) {
        return this.items.some(item => item.name === itemName);
    }

    printInventory() {
        console.log(this.items);
    }
}

class Item {
    constructor(name, properties = {}) {
        this.name = name;
        this.properties = properties;
    }

    use(player) {
        console.log(`${player.name} used ${this.name}`);
        // Add custom behavior based on item properties
    }
}

class Candy extends Item {
    constructor() {
        super('Candy', { hp: 1 });
    }

    use(player) {
        console.log(`${player.name} used ${this.name}`);
        player.health += this.properties.hp;
        console.log(player.health);
        player.scene.events.emit('updateHealth', player.health);
    }
}

class Apple extends Item {
    constructor() {
        super('Apple', { hp: 2 });
    }

    use(player) {
        console.log(`${player.name} used ${this.name}`);
        player.health += this.properties.hp;
        console.log(player.health);
        player.scene.events.emit('updateHealth', player.health);

    }
}

class Meat extends Item {
    constructor() {
        super('Meat', { hp: 3 });
    }

    use(player) {
        console.log(`${player.name} used ${this.name}`);
        player.health += this.properties.hp;
        console.log(player.health);
        player.scene.events.emit('updateHealth', player.health);

    }
}

class Sword extends Item {
    constructor() {
        super('Sword', { damage: 2 });
    }

    use(player) {
        console.log(`${player.name} used the sword!`);
        // Add custom sword behavior here
    }
}

class Spear extends Item {
    constructor() {
        super('Spear', { damage: 1 });
    }

    use(player) {
        console.log(`${player.name} used the spear!`);
        // Add custom spear behavior here
    }
}

class Pike extends Item {
    constructor() {
        super('Pike', { damage: 1.5 });
    }

    use(player) {
        console.log(`${player.name} used the pike!`);
        // Add custom pike behavior here
    }
}

class BaseEnemy {
    constructor(scene, x, y, key, walkAnim, idleAnim, jumpAnim) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, key);
        this.health = 10; // Set initial health
        this.damageTimer = null; // Timer for dealing damage to the player

        // Set enemy properties
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setGravityY(3000);
        this.sprite.setBounce(0.2);

        // Set enemy animations
        this.sprite.anims.play(walkAnim, true);

        // Handle collision with the ground layer
        scene.physics.add.collider(this.sprite, scene.groundLayer);

        // Add overlap detection with player for custom behavior
        scene.physics.add.overlap(this.sprite, scene.player, this.handlePlayerCollision, null, this);
    }

    update() {
        // Ensure enemy faces the player and gun points in the correct direction
        const direction = (this.scene.player.x < this.sprite.x) ? -1 : 1;
        this.sprite.setFlipX(direction === -1);

        const moveSpeed = 30; // Adjust this value to control the enemy's movement speed
        if (this.scene.player.x < this.sprite.x) {
            this.sprite.setVelocityX(-moveSpeed);
        } else if (this.scene.player.x > this.sprite.x) {
            this.sprite.setVelocityX(moveSpeed);
        } else {
            this.sprite.setVelocityX(0);
        }

        // Ensure the enemy falls down due to gravity
        if (this.sprite.body.blocked.down) {
            this.sprite.setVelocityY(0);
        } else {
            this.sprite.setVelocityY(this.sprite.body.velocity.y);
        }
    }

    handlePlayerCollision(enemySprite, playerSprite) {
        const currentTime = this.scene.time.now;
        if (currentTime - playerSprite.lastDamageTime >= 1000) { // Check for cooldown
            this.damagePlayer(playerSprite);
            playerSprite.setTint(0xffc1cc); // Set tint to red

            // Reset the tint after 1 second
            this.scene.time.delayedCall(1000, () => {
                playerSprite.clearTint();
            }, [], this);

            playerSprite.lastDamageTime = currentTime; // Update last damage time
        }
    }

    damagePlayer(playerSprite) {
        playerSprite.health -= 1;
        console.log(`Player health: ${playerSprite.health}`);
        if (playerSprite.health <= 0) {
            this.scene.playerDies();
        }
        // Update the health display
        this.scene.events.emit('updateHealth', playerSprite.health);
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`Enemy health: ${this.health}`);

        // Set red tint to indicate damage
        this.sprite.setTint(0xff0000);

        // Remove the red tint after a short delay
        this.scene.time.delayedCall(1000, () => {
            this.sprite.clearTint();
        });

        if (this.health <= 0) {
            this.scene.kills += 1; // Increment kills
            this.destroy();
        }
    }

    destroy() {
        this.sprite.destroy();
        if (this.damageTimer) {
            this.damageTimer.remove();
        }
    }
}

class PurpleEnemy extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'characters', 'purple-walk', 'purple-idle', 'purple-jump');
    }
}

class RedEnemy extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'characters', 'red-walk', 'red-idle', 'red-jump');
    }
}

class GreenEnemy extends BaseEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'characters', 'green-walk', 'green-idle', 'green-jump');
    }
}

class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 600;
        this.JUMP_VELOCITY = -700;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 2.0;

        this.kills = 0;

        this.SPAWN_LOCATION_X = 70;
        this.SPAWN_LOCATION_Y = 730;

        // Double jump and variable jump height variables
        this.doubleJumpTimer = null;
        this.DOUBLE_JUMP_VELOCITY = this.JUMP_VELOCITY / 2;
        this.isJumping = false;
        this.jumpStartTime = 0;
        this.jumps = 0;
        this.MAX_JUMPS = 2;

        this.isCrouching = false;
        this.CROUCH_SCALE = 0.5;
        this.CROUCH_JUMP_VELOCITY = this.JUMP_VELOCITY / 2;
        this.WALL_JUMP_VELOCITY_X = this.JUMP_VELOCITY * 0.95;
        this.WALL_JUMP_VELOCITY_Y = this.JUMP_VELOCITY * 0.85;
        this.DOUBLE_JUMP = true; // Enable double jump feature

        this.isWallJumping = false;
        this.wallJumpDirection = 0;
        this.allowWallJump = true;

        this.physics.world.gravity.y = 3000; // Increased from 1500
        this.MAX_JUMP_DURATION = 180; // Decreased from 300 to make jumps quicker

        this.isPlayerMoving = false; // Track player movement state
    }

    preload() {
        // Preload assets
        //this.load.spritesheet('platformer_characters', 'path/to/platformer_characters.png', { frameWidth: 64, frameHeight: 64 });
        //this.load.image("abstract-tileset", "path/to/abstract-tileset.png");
        //this.load.tilemapTiledJSON("levelone", "path/to/levelone.json");
        //this.load.bitmapFont('dritch', 'path/to/dritch_0.png', 'path/to/dritch.xml');
        //this.load.bitmapFont('b93', 'path/to/b93font.png', 'path/to/b93font.xml');
        //this.load.image("kenny-particles", "path/to/kenny-particles.png");
    }

    create() {
        // Create the tilemap and ground layer
        this.map = this.make.tilemap({ key: "levelone" });
        this.tileset = this.map.addTilesetImage("abstract-tileset", "tilemap_tiles", 64, 64);
        this.groundLayer = this.map.createLayer("ground", this.tileset, 0, 0);
        this.bgLayer = this.map.createLayer("bg", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

    // Create and tint the background overlay
    const bgTint = this.add.graphics();
    bgTint.fillStyle(0x808080, 0.5); // Example color with 50% transparency
    bgTint.fillRect(0, 0, this.bgLayer.width, this.bgLayer.height);
    bgTint.setDepth(-1); // Ensure it is behind other layers


        // Handle "platform" tiles
        this.groundLayer.forEachTile(tile => {
            if (tile.properties.platform) {
                tile.setCollision(false, false, true, false); // Only enable top collision
            }
        });

        this.scene.launch('UIScene');

        // Set up player avatar
        this.player = this.physics.add.sprite(this.SPAWN_LOCATION_X, this.SPAWN_LOCATION_Y, "platformer_characters", 0);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(this.player.width, this.player.height * 2); // Double the height
        this.player.body.setOffset(16, -1); // Start a few pixels higher

        // Health
        this.player.health = 10;
        this.player.setDepth(0);

        // Create Inventory
        this.player.inventory = new Inventory();
        this.player.inventory.addItem(new Sword());
        this.player.inventory.addItem(new Spear());
        this.player.inventory.addItem(new Pike());

        // Create enemies
        this.enemies = [];
        this.enemies.push(new PurpleEnemy(this, 370, 730));
        this.enemies.push(new RedEnemy(this, 500, 730)); // Add a RedEnemy
        this.enemies.push(new GreenEnemy(this, 600, 730)); // Add a GreenEnemy
        console.log(this.enemies);

        // Add sword image from sprite sheet and set it invisible initially
        this.swordImage = this.add.sprite(this.player.x, this.player.y, 'characters', 7); // Assuming 7 is the frame index for the sword
        this.swordImage.setVisible(false);
        this.swordImage.setAngle(45);
        this.swordImage.setDepth(1);

        // Add spear image from sprite sheet and set it invisible initially
        this.spearImage = this.add.sprite(this.player.x, this.player.y, 'characters', 51); // Assuming 51 is the frame index for the spear
        this.spearImage.setVisible(false);
        this.spearImage.setAngle(45);
        this.spearImage.setDepth(1);

        // Add pike image from sprite sheet and set it invisible initially
        this.pikeImage = this.add.sprite(this.player.x, this.player.y, 'characters', 18); // Assuming 18 is the frame index for the pike
        this.pikeImage.setVisible(false);
        this.pikeImage.setAngle(45);
        this.pikeImage.setDepth(1);

        // Enable collision handling
        this.physics.add.collider(this.player, this.groundLayer, this.handleTileCollision, null, this);

        // Ensure continuous collision checking
        this.player.body.onCollide = true;
        this.player.body.onWorldBounds = true;

        // Set up Phaser-provided cursor key input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');
        this.lShiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.yKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Y);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
        this.tKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
        this.gKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
        this.hKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);


        this.input.keyboard.enabled = true;

        this.input.keyboard.on('keydown-ONE', () => {
            let invsize = this.player.inventory.length;
            this.player.inventory.useItem('Candy', this.player);
            if (this.player.inventory.length < invsize) {
                this.scene.events.emit('updateHealth', playerSprite.health);
            }
        });
        this.input.keyboard.on('keydown-TWO', () => {
            let invsize = this.player.inventory.length;

            this.player.inventory.useItem('Apple', this.player);
            if (this.player.inventory.length < invsize) {
                this.scene.events.emit('updateHealth', playerSprite.health);
            }
        });
        this.input.keyboard.on('keydown-THREE', () => {
            let invsize = this.player.inventory.length;

            this.player.inventory.useItem('Meat', this.player);
            if (this.player.inventory.length < invsize) {
                this.scene.events.emit('updateHealth', playerSprite.health);
            }
        });

    

        // Item enable/disable listeners
        this.input.keyboard.on('keydown-FOUR', () => {
            if (this.player.inventory.hasItem('Pike')) {
                this.pikeImage.setVisible(!this.pikeImage.visible);
                this.swordImage.setVisible(false);
                this.spearImage.setVisible(false);
            }
        });

        this.input.keyboard.on('keydown-FIVE', () => {
            if (this.player.inventory.hasItem('Spear')) {
                this.spearImage.setVisible(!this.spearImage.visible);
                this.swordImage.setVisible(false);
                this.pikeImage.setVisible(false);
            }
        });

        this.input.keyboard.on('keydown-SIX', () => {
            if (this.player.inventory.hasItem('Sword')) {
                this.swordImage.setVisible(!this.swordImage.visible);
                this.spearImage.setVisible(false);
                this.pikeImage.setVisible(false);
            }
        });

        // Debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }, this);

        // Camera settings to follow the player and limit vertical movement
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        // VFX
        my.vfx.walking = this.add.particles(0, 0, 'characters', {
            frame: 97, // Assuming 97 is the frame index for the desired sprite
            scale: { start: 1.2, end: 0.2 },
            lifespan: 120,
            alpha: { start: .5, end: 0.1 },
            speedY: { min: -10, max: 10 },
            speedX: { min: -10, max: 10 }
        });

        my.vfx.walking.setDepth(0);
        my.vfx.walking.start();
        my.vfx.walking.stop();

        // Create items
        this.items = this.physics.add.group();

        const apple = this.items.create(200, 300, 'apple');
        apple.setScale(.5);
        apple.itemInstance = new Apple();

        const candy = this.items.create(400, 300, 'candy');
        candy.setScale(.5);
        candy.itemInstance = new Candy();

        const meat = this.items.create(600, 300, 'meat');
        meat.setScale(.5);
        meat.itemInstance = new Meat();

        const apple2 = this.items.create(800, 300, 'apple');
        apple2.setScale(.5);
        apple2.itemInstance = new Apple();

        // Add collision detection between player and items
        this.physics.add.overlap(this.player, this.items, this.pickupItem, null, this);

        // Add collision detection between items and ground
        this.physics.add.collider(this.items, this.groundLayer);

        this.player.lastDamageTime = 0;

        this.door = this.physics.add.sprite(600, 730, 'characters', 74);
        this.door.anims.play('door-closed');
        this.door.setImmovable(true);
        this.door.body.setAllowGravity(false);
        this.door.setDepth(-1);
        this.door.setTint(0x808080); // Initial gray color


        this.physics.add.overlap(this.player, this.door, this.openDoor, null, this);

        // UI event listeners for score changes
        this.events.on('addScore', this.updateDoorColor, this);

        // Set up key listeners
        this.input.keyboard.on('keydown-E', this.tryOpenDoor, this);
        this.input.keyboard.on('keydown-SPACE', this.tryOpenDoor, this);
    }

    updateDoorColor() {
        if (this.kills >= 3) {
            this.door.setTint(0xffffff); // Change to white when score is 3 or more
        } else {
            this.door.setTint(0x808080); // Keep it gray otherwise
        }
    }

    tryOpenDoor(event) {
        if (this.physics.overlap(this.player, this.door) && this.kills >= 3) {
            this.scene.start('CreditsScreen'); // Transition to credits
        }
    }

    update() {
        // Key down events
        if (Phaser.Input.Keyboard.JustDown(this.yKey)) {
            this.handleYKeyPress();
        }

        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            this.player.inventory.printInventory();
        }

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && 
            (this.swordImage.visible || this.spearImage.visible || this.pikeImage.visible)) {
            this.swordAttack();
        }

        // Handle player controls
        const maxFallingSpeed = 800; // Adjust this value as needed
        const maxRisingSpeed = -800;
        if (this.player.body.velocity.y > maxFallingSpeed) {
            this.player.body.setVelocityY(maxFallingSpeed);
        }
        if (this.player.body.velocity.y < maxRisingSpeed) {
            this.player.body.setVelocityY(maxRisingSpeed);
        }

        // Player ground check and reset double jump
        if (this.player.body.blocked.down) {
            this.isJumping = false;
            this.jumpStartTime = 0;
            this.jumps = 0;
            this.isWallJumping = false;
        }

        // Player movement controls
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-this.ACCELERATION);
            this.player.setFlip(true, false);
            this.player.anims.play('player-walk', true);

            my.vfx.walking.startFollow(this.player, this.player.displayWidth / 2 - 20, this.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (this.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(this.ACCELERATION);
            this.player.resetFlip();
            this.player.anims.play('player-walk', true);

            my.vfx.walking.startFollow(this.player, -this.player.displayWidth / 2 + 20, this.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (this.player.body.blocked.down) {
                my.vfx.walking.start();
            }
        } else {
            this.player.setAccelerationX(0);
            this.player.setVelocityX(0); // Snappily stop the player
            this.player.anims.play('player-idle');
            my.vfx.walking.stop();
        }

        // Handle wall jumping
        if (this.allowWallJump) {
            const leftTiles = this.groundLayer.getTilesWithinWorldXY(this.player.x - 10, this.player.y - this.player.height / 2, 10, this.player.height, { isNotEmpty: true });
            const rightTiles = this.groundLayer.getTilesWithinWorldXY(this.player.x + this.player.width, this.player.y - this.player.height / 2, 10, this.player.height, { isNotEmpty: true });

            const isTouchingWallLeft = leftTiles.some(tile => tile.collides);
            const isTouchingWallRight = rightTiles.some(tile => tile.collides);

            if ((isTouchingWallLeft || isTouchingWallRight) && !this.player.body.blocked.down) {
                if (isTouchingWallLeft && this.cursors.right.isDown) {
                    this.isWallJumping = true;
                    this.wallJumpDirection = -1; // Jump to the right
                } else if (isTouchingWallRight && this.cursors.left.isDown) {
                    this.isWallJumping = true;
                    this.wallJumpDirection = 1; // Jump to the left
                }
            }
        }

        // Handle jumping
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && (this.jumps < this.MAX_JUMPS || this.isWallJumping)) {
            this.isJumping = true;
            if (this.isWallJumping) {
                this.player.setVelocityY(this.JUMP_VELOCITY * 1.35);
                this.player.setVelocityX(this.wallJumpDirection * this.WALL_JUMP_VELOCITY_X); // Add outward velocity
                this.isWallJumping = false;
            } else if (this.jumps === 0) {
                this.player.setVelocityY(this.JUMP_VELOCITY);
                this.jumpStartTime = this.time.now;
            } else {
                this.player.setVelocityY(this.JUMP_VELOCITY * 1.25); // Increased to make the double jump higher
            }
            this.jumps++;
        }

        // Allow variable jump height
        if (this.cursors.up.isDown && this.isJumping && this.time.now - this.jumpStartTime < this.MAX_JUMP_DURATION) {
            this.player.setVelocityY(this.JUMP_VELOCITY);
        } else if (this.cursors.up.isUp) {
            this.isJumping = false;
        }

        // Handle crouching
        if (this.lShiftKey.isDown) {
            if (!this.isCrouching) {
                this.isCrouching = true;
                this.player.setScale(1, this.CROUCH_SCALE);
            }
        } else {
            if (this.isCrouching) {
                this.isCrouching = false;
                this.player.setScale(1, 1);
                this.player.y -= 5;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }

        // Check if the player fell off the screen
        if (this.player.y > this.map.height + 500) {
            this.playerDies();
        }

        // Update sword position
        if (this.cursors.left.isDown) {
            this.swordImage.setPosition(this.player.x - 30, this.player.y);
            this.swordImage.setAngle(-45); // Flip sword to the left
        } else if (this.cursors.right.isDown) {
            this.swordImage.setPosition(this.player.x + 30, this.player.y);
            this.swordImage.setAngle(45); // Flip sword to the right
        } else {
            this.swordImage.setPosition(this.player.x + (this.player.flipX ? -20 : 20), this.player.y);
        }

        // Update pike position
        if (this.cursors.left.isDown) {
            this.pikeImage.setPosition(this.player.x - 30, this.player.y);
            this.pikeImage.setAngle(-45); // Flip pike to the left
        } else if (this.cursors.right.isDown) {
            this.pikeImage.setPosition(this.player.x + 30, this.player.y);
            this.pikeImage.setAngle(45); // Flip pike to the right
        } else {
            this.pikeImage.setPosition(this.player.x + (this.player.flipX ? -20 : 20), this.player.y);
        }

        // Update spear position
        if (this.cursors.left.isDown) {
            this.spearImage.setPosition(this.player.x - 30, this.player.y);
            this.spearImage.setAngle(-45); // Flip spear to the left
        } else if (this.cursors.right.isDown) {
            this.spearImage.setPosition(this.player.x + 30, this.player.y);
            this.spearImage.setAngle(45); // Flip spear to the right
        } else {
            this.spearImage.setPosition(this.player.x + (this.player.flipX ? -20 : 20), this.player.y);
        }

        // Ensure enemy faces the player and gun points in the correct direction
        this.enemies.forEach(enemy => {
            const direction = (this.player.x < enemy.sprite.x) ? -1 : 1;
            enemy.sprite.setFlipX(direction === -1);
            enemy.update();
        });
    }

    playerDies() {
        //this.physics.pause();
        //this.cameras.main.shake(1000, 0.001);
        //this.input.keyboard.enabled = false;

        // Play death sound
        // this.sound.play('death');

        //let deathText = this.add.bitmapText(this.cameras.main.midPoint.x, this.cameras.main.midPoint.y, 'dritch', 'You Died!', 64).setOrigin(0.5);

        // this.time.delayedCall(5000, () => {
        //     this.scene.restart();
        // });
    }

    handleTileCollision(player, tile) {
        if (tile.properties.platform) {
            if (player.body.velocity.y > 0) {
                if (!tile.checkCollision) {
                    tile.checkCollision = { down: true };
                } else {
                    tile.checkCollision.down = true;
                }
                return true; // Enable collision when falling
            } else {
                if (!tile.checkCollision) {
                    tile.checkCollision = { down: false };
                } else {
                    tile.checkCollision.down = false;
                }
                return false; // Disable collision otherwise
            }
        }
        return true; // Default collision handling for other tiles
    }

    swordAttack() {
        let weapon = null;
        if (this.player.inventory.hasItem('Sword') && this.swordImage.visible) {
            weapon = { image: this.swordImage, damage: 3 };
        } else if (this.player.inventory.hasItem('Spear') && this.spearImage.visible) {
            weapon = { image: this.spearImage, damage: 2 };
        } else if (this.player.inventory.hasItem('Pike') && this.pikeImage.visible) {
            weapon = { image: this.pikeImage, damage: 1 };
        }

        if (weapon) {
            weapon.image.setVisible(true);
            if (this.player.flipX) {
                weapon.image.setAngle(-60);
            } else {
                weapon.image.setAngle(60);
            }

            // Check for collision with enemies and apply damage
            this.enemies.forEach((enemy, index) => {
                if (Phaser.Geom.Intersects.RectangleToRectangle(weapon.image.getBounds(), enemy.sprite.getBounds())) {
                    enemy.takeDamage(weapon.damage);
                    if (enemy.health <= 0) {
                        this.events.emit('addScore');
                        this.enemies.splice(index, 1); // Remove the enemy from the array if destroyed
                    }
                }
            });

            // Hide the weapon after a short duration
            this.time.delayedCall(200, () => {
                weapon.image.setAngle(this.player.flipX ? -45 : 45);
            });
        }
    }

    pickupItem(player, itemSprite) {
        player.inventory.addItem(itemSprite.itemInstance);
        itemSprite.destroy();
        // Update the health display
    }

    handleYKeyPress() {
        // Play the exit sound
        //this.sound.play('exit');

        // Transition to the EndScene
        this.player.health = 0;

        //this.scene.start('CreditsScreen');
    }

    openDoor(player, door) {
        door.anims.play('door-open');
        door.setTint(0x808080); // Set tint to full black
    }
}

// Title Screen
class TitleScreen extends Phaser.Scene {
    constructor() {
        super("TitleScreen");
    }

    preload() {
        // Title Card
        this.load.setPath('./assets/');
        this.load.image("titleCard", "TitleCard.png");

        // Load the bitmap font
        this.load.setPath('./assets/fonts');
        this.load.bitmapFont('dritch', 'dritch_0.png', 'dritch.xml');
    }

    create() {
        // Background

        this.scene.stop('UIScene');
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 1).setOrigin(0);

        // Title Card
        const titleCard = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2.67, 'titleCard'); // Top 3/4ths
        titleCard.setOrigin(0.5, 0.5);

        // Scale title card to fit within the canvas
        const scaleX = this.cameras.main.width / titleCard.width;
        const scaleY = this.cameras.main.height * 0.65 / titleCard.height;
        const scale = Math.min(scaleX, scaleY);
        titleCard.setScale(scale);

        // Instructions
        const instructions = this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height * 7 / 8, 'dritch', 'Press <Q> to start playing!', 64).setOrigin(0.5);

        // Make the instructions slowly flash
        this.tweens.add({
            targets: instructions,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Input listener to return to the game when any key is pressed
        this.input.keyboard.once('keydown-Q', () => {
            this.scene.start('Platformer');
            this.gameRestart();
        });
    }

    gameRestart() {
        this.scene.start('platformerScene');
    }
}

// Credits Screen
class CreditsScreen extends Phaser.Scene {
    constructor() {
        super("CreditsScreen");
    }

    preload() {
        // Load the bitmap font
        this.load.setPath('./assets/fonts');
        this.load.bitmapFont('b93', 'b93font.png', 'b93font.xml');
    }

    create() {

        this.scene.stop('UIScene');

        // Background
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xC3B1E1, 1).setOrigin(0);

        // Credits Text
        this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'b93', 'Primary Assets - Kenney', 64).setOrigin(0.5);
        this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2, 'b93', 'Audio - Nathan Shturm', 64).setOrigin(0.5);
        this.add.bitmapText(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, 'b93', 'Gameplay Programming - Nathan Shturm', 64).setOrigin(0.5);

        // Input listener to return to the game when Q key is pressed
        this.input.keyboard.once('keydown-Q', () => {
            this.scene.start('Platformer');
            this.gameRestart();
        });
    }

    gameRestart() {
        this.scene.start('platformerScene');
    }
}

class UI extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene', active: false }); // Set active to false initially

        this.score = 0;
        this.health = 10;
    }

    preload() {
        this.load.setPath('./assets/');
        this.load.image('binds', 'keybinds.png');
    }

    create() {
        // Our Text object to display the Score
        this.info = this.add.text(10, 10, 'Score: 0', { font: '80px dritch', fill: '#fff' });
        this.pHealth = this.add.text(10, 156, 'Health: 10', {font: '80px dritch', fill: '#fff'});

        // Grab a reference to the Game Scene
        let ourGame = this.scene.get('platformerScene');

        // Listen for events from it
        ourGame.events.on('addScore', this.updateScore, this);

        ourGame.events.on('updateHealth', this.updateHealth, this);

        // Display the keybinds image at the bottom left
    const keybindsImage = this.add.image(0, 0, 'binds').setOrigin(0, 1);
    keybindsImage.setPosition(10, this.cameras.main.height - 10); // Adjust the 10s as needed for padding
    keybindsImage.setScale(2);

    }

    updateScore() {
        this.score += 1;
        this.info.setText('Score: ' + this.score);

        // Tint the text yellow
        this.info.setTint(0xffff00);

        // Create a delayed call to clear the tint after 1 second
        this.time.delayedCall(1000, () => {
            this.info.clearTint();
        });
    }

    updateHealth(newHealth) {
        this.health = newHealth;
        this.pHealth.setText('Health: ' + this.health);

        // Tint the text red
        this.pHealth.setTint(0xff0000);

        // Create a delayed call to clear the tint after 1 second
        this.time.delayedCall(1000, () => {
            this.pHealth.clearTint();
        });
    }
}
