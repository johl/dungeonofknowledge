var chars = {
        wall: '#',
        entity: 'E'
    },
    colors = {
        '@': '#F00',
        '.': '#630',
        '#': '#666',
        'E': '#FF0'
    };

var Game = {
    display: null,
    map: {},
    wikidataEntities: {},
    engine: null,
    player: null,

    init: function() {
        var options = {
            width: 64,
            height: 36,
            forceSquareRatio: true
        };
        this.display = new ROT.Display( options );
        document.getElementById( 'screen' ).appendChild( this.display.getContainer() );

        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add( this.player, true );

        this.engine = new ROT.Engine( scheduler );
        this.engine.start();
    },

    _generateMap: function() {
        var options = this.display.getOptions();
        var digger = new ROT.Map.Digger( options.width, options.height - 5 );
        var freeCells = [];

        var digCallback = function( x, y, value ) {
            if ( value ) {
                return;
            }

            var key = x + ',' + y;
            this.map[ key ] = '.';
            freeCells.push( key );

            this.createWalls( x, y );
        };
        digger.create( digCallback.bind( this ) );

        this._generateWikidataEntities( freeCells );
        this._drawWholeMap();
        this._createPlayer( freeCells );
    },

    createWalls: function( x, y ) {
        // Surround a walkable cell with a square wall
        var dirs = ROT.DIRS[ 8 ];
        for ( var i = 0; i < 8; i++ ) {
            var key = ( x + dirs[ i ][ 0 ] ) + ',' + ( y + dirs[ i ][ 1 ] );
            if ( !( this.map[ key ] ) ) {
                this.map[ key ] = chars.wall;
            }
        }
    },

    _createPlayer: function( freeCells ) {
        var index = Math.floor( ROT.RNG.getUniform() * freeCells.length );
        var key = freeCells.splice( index, 1 )[ 0 ];
        var parts = key.split( ',' ),
            x = parts[ 0 ] | 0,
            y = parts[ 1 ] | 0;
        this.player = new Player( x, y );
    },

    _generateWikidataEntities: function( freeCells ) {
        var toFill = [];

        for ( var i = 0; i < 20; i++ ) {
            var index = Math.floor( ROT.RNG.getUniform() * freeCells.length );
            var key = freeCells.splice( index, 1 )[ 0 ];
            this.wikidataEntities[ key ] = {
                title: 'Nothing to see here',
                wand: Math.random() > 0.7 ? 1 : 0
            };
            this.map[ key ] = chars.entity;
            toFill.push( key );
        }
        // Place animals
        for ( var i = 0; i < 10; i++ ) {
            var keys =  Object.keys( animals );
            var random_animal = keys[ keys.length * Math.random() << 0 ];
            var index = Math.floor( ROT.RNG.getUniform() * freeCells.length );
            var key = freeCells.splice( index, 1 )[ 0 ];
            this.wikidataEntities[ key ] = {
                title: animals.key
            };
            this.map[ key ] = random_animal;
        }

        var self = this;
        getArt( function( itemId, item ) {
            var key = toFill.shift();
            if ( !key ) {
                return;
            }

            self.wikidataEntities[ key ].title = item.label + ', ' + item.description;
            self.wikidataEntities[ key ].image = item.image;
        } );
    },

    isCell: function( x, y, char ) {
        var key = x + ',' + y;
        return key in this.map && this.map[ key ] === char;
    },

    isFreeCell: function( x, y ) {
        var key = x + ',' + y;
        return !( key in this.map );
    },

    isWalkableCell: function( x, y ) {
        var key = x + ',' + y;
        return key in this.map && this.map[ key ] !== chars.wall;
    },

    drawCell: function( key ) {
        var parts = key.split( ',' ),
            x = parts[ 0 ] | 0,
            y = parts[ 1 ] | 0,
            char = this.map[ key ];
        this.display.draw( x, y, char, colors[ char ] || '#CCC' );
    },

    drawTextBox: function( text ) {
        var options = this.display.getOptions(),
            player = this.player || {};

        for ( var y = options.height - 1; y > options.height - 5; y-- ) {
            this.display.drawText( 0, y, '%c{#333}' + Array( options.width + 1 ).join( '\\' ) );
        }
        this.display.drawText( 0, y, '%c{#FFF}' + Array( options.width + 1 ).join( '~' ) );
        this.display.drawText( 0, options.height - 4, '%c{#F00}' + ( text || '' ) );
        var status = 'Wand of Ontological Clarity: ' + ( player.wand || 0 );
        this.display.drawText( options.width - status.length, options.height - 1, '%c{#090}' + status );
    },

    _drawWholeMap: function() {
        for ( var key in this.map ) {
            this.drawCell( key );
        }

        this.drawTextBox();
    }
};

var Player = function( x, y ) {
    this._x = x;
    this._y = y;
    this.wand = 0;
    this._draw();
};

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener( 'keydown', this );
};

Player.prototype.handleEvent = function( e ) {
    var walkingKeyMap = {
        // Arrow keys, Pos1/End, PgUp/Down
        38: 0,
        33: 1,
        39: 2,
        34: 3,
        40: 4,
        35: 5,
        37: 6,
        36: 7,
        // HJKL
        72: 6,
        74: 4,
        75: 0,
        76: 2,
        // WASD
        87: 0,
        65: 6,
        83: 4,
        68: 2
    };

    var code = e.keyCode,
        key = this._x + ',' + this._y,
        options = Game.display.getOptions();

    if ( code in walkingKeyMap ) {
        var dir = ROT.DIRS[ 8 ][ walkingKeyMap[ code ] ];
        var newX = this._x + dir[ 0 ];
        var newY = this._y + dir[ 1 ];
        if ( !Game.isWalkableCell( newX, newY ) ) {
            return;
        }

        Game.drawCell( key );
        this._x = newX;
        this._y = newY;
        this._draw();
        Game.drawTextBox();
    } else if ( code === ROT.VK_Z && this.wand ) {
        // Zap the wand!
        this.wand--;
        var size = 3;
        for ( var deltaX = -size; deltaX <= size; deltaX++ ) {
            for ( var deltaY = -size; deltaY <= size; deltaY++ ) {
                // Star shape
                if ( Math.abs( deltaX ) + Math.abs( deltaY ) > 3 ) {
                    continue;
                }

                var x = this._x + deltaX,
                    y = this._y + deltaY;
                if ( x <= 0 || y <= 0 || x >= options.width - 1 || y >= options.height - 6 ) {
                    continue;
                }

                if ( !Game.isFreeCell( x, y ) && !Game.isCell( x, y, chars.wall )) {
                    continue;
                }

                Game.map[ x + ',' + y ] = '.';
                Game.createWalls( x, y );
                Game._drawWholeMap();
                this._draw();
            }
        }
        Game.drawTextBox( 'You zapped the wand, and BOOM! The wand vanishes after zapping.' );
    } else if ( ( code === ROT.VK_SPACE || code === ROT.VK_E )
        //&& Game.isCell( this._x, this._y, chars.entity )
        && Game.wikidataEntities[ key ]
    ) {
        var wikidataEntity = Game.wikidataEntities[ key ] || {},
            title = wikidataEntity.title;

        // Loot the entity
        if ( Game.map[ key ] == chars.entity ) {
          Game.map[ key ] = 'e';
          var wand = wikidataEntity.wand || 0;
          this.wand += wand;

          var msg = title ? 'You looted this entity: ' + title : 'This entity is empty :-(';
          if ( wand ) {
              msg += '\nYou found ' + ( wand === 1 ? 'a' : wand ) + ' wand (press Z to zap)';
              wand = 0;
          }
          Game.drawTextBox( msg );
          var url = getImageUrl( wikidataEntity.image );
          document.getElementById( 'painting' ).src = url;

          // Empty the entity
          wikidataEntity.title = '';
          wikidataEntity.wand = 0;
        }
        if ( ( Game.map[ key ] !==  chars.entity ) &&  ( Game.map[ key ] !==  'e'  ) ) {
          Game.drawTextBox( animals[ Game.map[ key ]] );
        }
     } else {
        // Debug only: show key code in title.
        document.title = code;
        return;
    }

    window.removeEventListener( 'keydown', this );
    Game.engine.unlock();
};

Player.prototype._draw = function() {
    Game.display.draw( this._x, this._y, '@', colors[ '@' ] );
};

Game.init();
