var chars = {
		wall: '#',
		entity: 'E'
	},
	colors = {
		'@': '#f00',
		'.': '#630',
		'#': '#666',
		'E': '#ff0'
	};

var Game = {
	display: null,

	map: {},

	wikidataEntities: {},

	engine: null,

	/**
	 * @type {Player}
	 */
	player: null,

	/**
	 * @type {Animal[]}
	 */
	animalInstances: [],

	sanity: 100,

	init: function() {
		var options = {
			width: 64,
			height: 36,
			forceSquareRatio: true
		};
		this.display = new ROT.Display( options );
		document.getElementById( 'screen' ).appendChild( this.display.getContainer() );

		this._generateMap();
		this._drawWholeMap();
		this.drawTextBox();

		var scheduler = new ROT.Scheduler.Simple();
		scheduler.add( this.player, true );
		this.animalInstances.forEach( function( animal ) {
			scheduler.add( animal, true );
		} );

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
		this._placeAnimals( freeCells );
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
		var index = Math.floor( ROT.RNG.getUniform() * freeCells.length ),
			key = freeCells.splice( index, 1 )[ 0],
			coordinates = this.splitKey( key ),
			x = coordinates[ 0 ],
			y = coordinates[ 1 ];
		this.player = new Player( x, y );
	},

	_generateWikidataEntities: function( freeCells ) {
		var self = this,
			toFill = [];

		for ( var i = 0; i < 20; i++ ) {
			var index = Math.floor( ROT.RNG.getUniform() * freeCells.length ),
				key = freeCells.splice( index, 1 )[ 0 ];

			this.wikidataEntities[ key ] = {
				title: 'Nothing to see here',
				wand: Math.random() > 0.7 ? 1 : 0
			};
			this.map[ key ] = chars.entity;
			toFill.push( key );
		}

		getArt( _.sample( levels ), function( itemId, item ) {
			var key = toFill.shift();
			if ( !key ) {
				return;
			}

			self.wikidataEntities[ key ].title = item.label + ', ' + item.description;
			self.wikidataEntities[ key ].image = item.image;
		} );
	},

	_placeAnimals: function( freeCells ) {
		for ( var i = 0; i < 10; i++ ) {
			var animalSymbols = Object.keys( animals ),
				animalSymbol = animalSymbols[ animalSymbols.length * Math.random() << 0],
				index = Math.floor( ROT.RNG.getUniform() * freeCells.length ),
				key = freeCells.splice( index, 1 )[ 0],
				coordinates = this.splitKey( key ),
				x = coordinates[ 0 ],
				y = coordinates[ 1 ];
			this.animalInstances.push( new Animal( x, y, animalSymbol, animals[animalSymbol] ) );
		}
	},

	damagePlayerWhenTouchingAnimal: function( playerX, playerY ) {
		var animalChar;

		for ( var index in this.animalInstances ) {
			var animal = this.animalInstances[ index ];
			if ( animal._x === playerX && animal._y === playerY ) {
				animalChar = animal._symbol;
				break;
			}
		}

		if ( Object.keys( animals ).includes( animalChar ) ) {
			var max = 80,
				min = 30,
				damage = Math.floor( Math.random() * ( max - min + 1 ) ) + min;
			this.sanity = Math.max( this.sanity - damage, 0 );
			this.drawTextBox( 'Your were hit by ' + animals[ animalChar ] );
			return damage;
		}

		return 0;
	},

	/**
	 * @param {string} key
	 * @returns {number[]}
	 */
	splitKey: function ( key ) {
		var parts = key.split( ',', 2 );
		return [ parts[0] | 0, parts[1] | 0 ];
	},

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	isZappableCell: function( x, y ) {
		var options = this.display.getOptions(),
			key = x + ',' + y;
		if ( x < 1 || y < 1 || x > options.width - 2 || y > options.height - 7 ) {
			return false;
		}
		return !key in this.map
			|| this.map[ key ] === chars.wall;
	},

	zapAnimal: function( x, y ) {
		for ( var i in this.animalInstances ) {
			if ( this.animalInstances.hasOwnProperty( i )
				&& this.animalInstances[ i ]._x === x
				&& this.animalInstances[ i ]._y === y
			) {
				this.engine._scheduler.remove( this.animalInstances[ i ] );
				delete this.animalInstances[ i ];
			}
		}
	},

	isWalkableCell: function( x, y ) {
		var key = x + ',' + y;
		return key in this.map && this.map[ key ] !== chars.wall;
	},

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	drawCell: function( x, y ) {
		var char = this.map[ x + ',' + y ];
		this.display.draw( x, y, char, colors[ char ] || '#ccc' );
	},

	drawTextBox: function( text ) {
		var options = this.display.getOptions(),
			player = this.player || {};

		for ( var y = options.height - 1; y > options.height - 5; y-- ) {
			this.display.drawText( 0, y, '%c{#333}' + Array( options.width + 1 ).join( '\\' ) );
		}
		this.display.drawText( 0, y, '%c{#FFF}' + Array( options.width + 1 ).join( '~' ) );
		this.display.drawText( 0, options.height - 4, '%c{#F00}' + ( text || '' ) );
		this.display.drawText( 0, options.height - 1, '%c{#090}' + 'Sanity: ' + this.sanity + '%');
		var status = 'Wand of Ontological Clarity: ' + ( player.wand || 0 );
		this.display.drawText( options.width - status.length, options.height - 1, '%c{#090}' + status );
	},

	_drawWholeMap: function() {
		for ( var key in this.map ) {
			var coordinates = this.splitKey( key );
			this.drawCell( coordinates[ 0 ], coordinates[ 1 ] );
		}
		for ( var index in this.animalInstances ) {
			if ( this.animalInstances.hasOwnProperty(index) ) {
				this.animalInstances[index]._draw();
			}
		}
		this.player._draw();
	}
};

/**
 * @class {Animal}
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {string} symbol
 * @param {string} description
 */
var Animal = function( x, y, symbol, description ) {
	this._x = x;
	this._y = y;
	this._symbol = symbol;
	this._description = description;
	this._direction = ( Math.random() * 4 ) | 0;
	this._step = ( Math.random() * 6 ) | 0;
};

Animal.prototype.act = function() {
	/* this._step--;
	if ( this._step <= 0 ) {
		this._step += 6;
		this._direction = ( Math.random() * 4 ) | 0;
		return;
	} else if ( this._step < 3 ) {
		return;
	}

	var toX = this._x + ( this._direction === 1 ? 1 : ( this._direction === 3 ? -1 : 0 ) );
	var toY = this._y + ( this._direction === 2 ? 1 : ( this._direction === 0 ? -1 : 0 ) );
	if ( Game.map[toX + ',' + toY] !== '.' ) {
		this._step = 0;
		return;
	}

	this._x = toX;
	this._y = toY;
	// this._draw();
	// Game.player._draw();
	*/
        var x = Game.player._x;
	var y = Game.player._y;
    	var passableCallback = function(x, y) {
		return (x+","+y in Game.map);
	}
	var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});
	
	var path = [];
	var pathCallback = function(x, y) {
		path.push([x, y]);
	}
	astar.compute(this._x, this._y, pathCallback);
	path.shift();
	x = path[0][0];
	y = path[0][1];
	Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);
	this._x = x;
	this._y = y;
	this._draw();
	Game.player._draw();
	if ( this._x === Game.player._x && this._y === Game.player._y ) {
		Game.damagePlayerWhenTouchingAnimal( Game.player._x, Game.player._y );
	}
};

Animal.prototype._draw = function() {
	Game.display.draw( this._x, this._y, this._symbol, '#ccc' );
};

/**
 * @class {Player}
 * @constructor
 * @param {number} x
 * @param {number} y
 */
var Player = function( x, y ) {
	this._x = x;
	this._y = y;
	this.wand = 0;
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

	// Check if game is won
	if ( !Object.values( Game.map ).includes( chars.entity ) ) {
		Game.engine.lock();
		alert( "You have found every entity in this dungeon.\n" +
			"An invisible choir sings, and you are bathed in radiance...\n" +
			"A voice thunders: \"Congratulations, adventurer! You have won the game!\""
		);
		window.location.reload( true );
	}
	// Check if the game is lost
	if ( Game.sanity <= 0 ) {
		Game.engine.lock();
		alert( "Madness has taken its toll.\n" +
			"You hit one strange creature too many...\n" +
			"You have lost the game. Better luck next time."
		);
		window.location.reload( true );
	}

	var code = e.keyCode,
		key = this._x + ',' + this._y;

	Game.drawTextBox();

	if ( code in walkingKeyMap ) {
		var dir = ROT.DIRS[ 8 ][ walkingKeyMap[ code ] ];
		var newX = this._x + dir[ 0 ];
		var newY = this._y + dir[ 1 ];
		if ( !Game.isWalkableCell( newX, newY ) ) {
			return;
		}
		this._x = newX;
		this._y = newY;
		Game._drawWholeMap();
		Game.damagePlayerWhenTouchingAnimal( newX, newY );
	} else if ( code === ROT.VK_Z && this.wand ) {
		// Zap the wand!
		this.wand--;
		var size = 3;
		for ( var deltaX = -size; deltaX <= size; deltaX++ ) {
			for ( var deltaY = -size; deltaY <= size; deltaY++ ) {
				// Star shape
				if ( Math.abs( deltaX ) + Math.abs( deltaY ) > size ) {
					continue;
				}

				var x = this._x + deltaX,
					y = this._y + deltaY;

				Game.zapAnimal( x, y );
				if ( Game.isZappableCell( x, y ) ) {
					Game.map[ x + ',' + y ] = '.';
					Game.createWalls( x, y );
				}
			}
		}
		Game._drawWholeMap();
		Game.drawTextBox( 'You zapped the wand, and BOOM! The wand vanishes after zapping.' );
	} else if ( ( code === ROT.VK_SPACE || code === ROT.VK_E ) && Game.wikidataEntities[ key ]) {
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
			changeImage( wikidataEntity.image );

			// Empty the entity
			wikidataEntity.title = '';
			wikidataEntity.wand = 0;
		}
		if ( ( Game.map[ key ] !== chars.entity ) && ( Game.map[ key ] !== 'e' ) ) {
			Game.drawTextBox( animals[ Game.map[ key ]] );
		}
	} else {
		// Debug only: show key code in title.
		// document.title = code;
	}

	window.removeEventListener( 'keydown', this );
	Game.engine.unlock();
};

Player.prototype._draw = function() {
	Game.display.draw( this._x, this._y, '@', colors[ '@' ] );
};

Game.init();
