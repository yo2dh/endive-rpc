var utils = require( 'util' );
var util = require( 'endive-util' );
var net = require( 'net' );
var EventEmitter = require( 'events' ).EventEmitter;

var Protocol = require( './../protocol/protocol' );
var RemoteInterface = require( './../interface/remoteInterface' );

var STATE_NONE          = 0;
var STATE_CONNECTING    = 1;
var STATE_CONNECTED     = 2;
var STATE_DISCONNECTED  = 3;


function Client( ownerListener , host , port , id , localFunctions ) {

    EventEmitter.call( this );

    this.ownerListener  = ownerListener;
    this.host           = host;
    this.port           = port;
    this.id             = id;
    this.socket         = null;

    this.state          = STATE_NONE;
    this.isStart        = false;

    this.timerId        = null;

    this.protocol       = new Protocol( this , localFunctions );

    this.retryConnectInterval = 1000;

    var self = this;
    this.on( 'remoteReady' , function( i ) {
        self.ownerListener.emit( 'remoteReady' , i , this );
    });
    this.on( 'remoteTerminated' , function( i ) {
        self.ownerListener.emit( 'remoteTerminated' , i , this );
    });
    this.on( 'send' , function( data ) {
        self.send ( data );
    });
};

utils.inherits( Client , EventEmitter );

module.exports = Client;

Client.prototype.getInterface = function() {
    return this.protocol.getRemoteInterface();
};

Client.prototype.start = function() {
    if ( this.isStart === true ) return;
    this.tryToConnect();
    this.isStart = true;
};

Client.prototype.stop = function() {
    if ( this.isStart === false ) return;
    this.isStart = false;
    var socket = this.socket;
    if ( socket )
    {
        socket.destroy();
        this.state = STATE_DISCONNECTED;
    }
    if ( this.timerId != null )
    {
        clearTimeout ( this.timerId );
    }
};

Client.prototype.tryToConnect  = function () {
    if ( this.state === STATE_CONNECTED || this.state === STATE_CONNECTING ) return;
    this.timerId = null;

    var self = this;
    util.log( '[%s] Client try to connect: %s:%s' , this.id , this.host , this.port );
    this.state = STATE_CONNECTING;
    var socket = this.socket = net.connect( this.port , this.host );

    this.test = 0;
    socket.on( 'connect' , function() { self.onConnect() } );
    socket.on( 'error' , function( e ) { self.onError( e ) } );
    socket.on( 'data' , function( data ) { self.onData ( data ) } );
    socket.on( 'close' , function() { self.onClose(); } );
};

Client.prototype.setRetryConnectInterval = function ( interval ) {
    this.retryConnectInterval = interval;
};

Client.prototype.send = function( data ) {

    var self = this;
    (function( sentLength ) {
        self.socket.write( data , 'utf-8' , function() {
            util.log( '[%s] Connection data was written: [%d][%d]' , self.id , data.length , self.test ++ );
        });
    })( data.length );
};

Client.prototype.onConnect = function() {
    util.log( '[%s] Client connected: %s:%d' , this.id , this.host , this.port );
    this.protocol.onConnected();
    this.state = STATE_CONNECTED;
};

Client.prototype.onClose = function() {
    util.log( '[%s] Client closed: %s:%d' , this.id , this.host , this.port );
    this.state = STATE_DISCONNECTED;

    if ( this.isStart )
    {
        this.timerId = setTimeout( this.tryToConnect.apply ( this ) , this.retryConnectInterval );
    }
    this.protocol.onDisconnected();
};

Client.prototype.onData = function( data ) {
    util.log( '[%s] Client data was received: %d' , this.id , data.length );
    this.protocol.processPacket( data );
};

Client.prototype.onError = function( e ) {
    if ( e.code === 'ECONNREFUSED' )
    {
        this.state = STATE_DISCONNECTED;
//            process.nextTick ( self.tryToConnect() );
    }
    util.error( '[%s] Client error: %s' , this.id , e.code );
};

