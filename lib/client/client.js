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


function Client( host , port , id ) {

    EventEmitter.call( this );

    this.host       = host;
    this.port       = port;
    this.id         = id;
    this.socket     = null;

    this.state      = STATE_NONE;
    this.isStart    = false;

    this.retryConnectInterval = 1000;
    this.timerId    = null;

    this.interface  = new RemoteInterface();
    this.protocol   = new Protocol( this );
    this.functions = {};

    var self = this;
    this.on( 'jsonData' , function( jsonData ) {
        self.onJsonData( jsonData );
    });
    this.on( 'functionCall' , function( functionCall ) {
        self.onFunctionCall( functionCall );
    });
};

utils.inherits( Client , EventEmitter );

module.exports = Client;

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
    var c = this.socket;
    var length = data.length;
    c.write( data , 'utf-8' , function() {
        util.log( '[%s] Connection data was written: [%d][%d]' , self.id , data.length , self.test ++ );
    });
};

Client.prototype.onConnect = function() {
    util.log( '[%s] Client connected: %s:%d' , this.id , this.host , this.port );
    this.state = STATE_CONNECTED;
};

Client.prototype.onClose = function() {
    util.log( '[%s] Client closed: %s:%d' , this.id , this.host , this.port );
    this.state = STATE_DISCONNECTED;

    if ( this.isStart )
    {
        this.timerId = setTimeout( this.tryToConnect.apply ( this ) , this.retryConnectInterval );
    }
};

Client.prototype.onData = function( data ) {
    util.log( '[%s] Connection data was received: %d' , this.id , data.length );
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

Client.prototype.onJsonData = function( jsonData ) {
};

Client.prototype.onFunctionCall = function( functionCall ) {

};
