var chars = {
		wall: '#',
		crate: 'E'
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
		var digger = new ROT.Map.Digger( options.width, options.height );
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
		for ( var i = 0; i < 10; i++ ) {
			var index = Math.floor( ROT.RNG.getUniform() * freeCells.length );
			var key = freeCells.splice( index, 1 )[0];
			this.map[key] = chars.crate;
		}
	},

	drawCell: function( key ) {
		var parts = key.split( ',' ),
			x = parts[0] | 0,
			y = parts[1] | 0,
			char = this.map[key];
		this.display.draw( x, y, char, colors[char] || '#CCC' );
	},

	_drawWholeMap: function() {
		for ( var key in this.map ) {
			this.drawCell( key );
		}
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
	var keyMap = {};
	keyMap[38] = 0;
	keyMap[33] = 1;
	keyMap[39] = 2;
	keyMap[34] = 3;
	keyMap[40] = 4;
	keyMap[35] = 5;
	keyMap[37] = 6;
	keyMap[36] = 7;

	var code = e.keyCode;
	/* one of numpad directions? */
	if ( !( code in keyMap ) ) {
		return;
	}

	/* is there a free space? */
	var dir = ROT.DIRS[8][keyMap[code]];
	var newX = this._x + dir[0];
	var newY = this._y + dir[1];
	var newKey = newX + ',' + newY;
	if ( !( newKey in Game.map )
		|| Game.map[newKey] === chars.wall
	) {
		return;
	}

	Game.drawCell( this._x + ',' + this._y );
	this._x = newX;
	this._y = newY;
	this._draw();
	window.removeEventListener( 'keydown', this );
	Game.engine.unlock();
};

Player.prototype._draw = function() {
	Game.display.draw( this._x, this._y, '@', colors['@'] );
};

Game.init();
