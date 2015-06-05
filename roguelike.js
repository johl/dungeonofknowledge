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
	engine: null,
	player: null,

	init: function() {
		var options = {
			width: 80,
			height: 40,
			forceSquareRatio: true
		};
		this.display = new ROT.Display( options );
		document.body.appendChild( this.display.getContainer() );

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
			this.map[key] = '.';
			freeCells.push( key );

			// Surround the walkable cells with a wall
			var dirs = ROT.DIRS[8];
			for ( var i in dirs ) {
				key = ( x + dirs[i][0] ) + ',' + ( y + dirs[i][1] );
				if ( !( this.map[key] ) ) {
					this.map[key] = chars.wall;
				}
			}
		};
		digger.create( digCallback.bind( this ) );

		this._generateBoxes( freeCells );
		this._drawWholeMap();
		this._createPlayer( freeCells );
	},

	_createPlayer: function( freeCells ) {
		var index = Math.floor( ROT.RNG.getUniform() * freeCells.length );
		var key = freeCells.splice( index, 1 )[0];
		var parts = key.split( ',' ),
			x = parts[0] | 0,
			y = parts[1] | 0;
		this.player = new Player( x, y );
	},

	_generateBoxes: function( freeCells ) {
		for ( var i = 0; i < 20; i++ ) {
			var index = Math.floor( ROT.RNG.getUniform() * freeCells.length );
			var key = freeCells.splice( index, 1 )[0];
			this.map[key] = chars.entity;
		}
	},

	isCell: function( x, y, char ) {
		var key = x + ',' + y;
		return key in this.map && this.map[key] === char;
	},

	isFreeCell: function( x, y ) {
		var key = x + ',' + y;
		return key in this.map && this.map[key] !== chars.wall;
	},

	drawCell: function( key ) {
		var parts = key.split( ',' ),
			x = parts[0] | 0,
			y = parts[1] | 0,
			char = this.map[key];
		this.display.draw( x, y, char, colors[char] || '#CCC' );
	},

	drawTextBox: function( text ) {
		var options = this.display.getOptions();

		for ( var y = options.height - 1; y > options.height - 5; y-- ) {
			this.display.drawText( 0, y, '%c{#333}' + Array( options.width + 1 ).join( '\\' ) );
		}
		this.display.drawText( 0, y, '%c{#FFF}' + Array( options.width + 1 ).join( '~' ) );
		this.display.drawText( 0, options.height - 4, '%c{#F00}' + ( text || '' ) );
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
	this._draw();
};

Player.prototype.act = function() {
	Game.engine.lock();
	window.addEventListener( 'keydown', this );
};

Player.prototype.handleEvent = function( e ) {
	var walkingKeyMap = {
		// Arrow keys, PgUp/Down, Pos1, End
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
		76: 2
	};

	var code = e.keyCode;

	if ( code in walkingKeyMap ) {
		var dir = ROT.DIRS[8][walkingKeyMap[code]];
		var newX = this._x + dir[0];
		var newY = this._y + dir[1];
		if ( !Game.isFreeCell( newX, newY ) ) {
			return;
		}

		Game.drawCell( this._x + ',' + this._y );
		this._x = newX;
		this._y = newY;
		this._draw();
    Game.drawTextBox( '' );
	} else if ( code === ROT.VK_SPACE
		&& Game.isCell( this._x, this._y, chars.entity )
	) {
		Game.drawTextBox( 'This entity is empty :-(' );
	} else {
		document.title = code;
		return;
	}

	window.removeEventListener( 'keydown', this );
	Game.engine.unlock();
};

Player.prototype._draw = function() {
	Game.display.draw( this._x, this._y, '@', colors['@'] );
};

Game.init();
