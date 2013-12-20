var util = require( 'utils' );
var net = require( 'net' );

var STATE_NONE          = 0;
var STATE_CONNECTING    = 1;
var STATE_CONNECTED     = 2;
var STATE_DISCONNECTED  = 3;


function Client( host , port , id ) {

    this.host       = host;
    this.port       = port;
    this.id         = id;
    this.socket     = null;

    this.state      = STATE_NONE;
    this.isStart    = false;

    this.retryConnectInterval = 1000;

};

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
};

Client.prototype.tryToConnect  = function () {
    if ( this.state === STATE_CONNECTED || this.state === STATE_CONNECTING ) return;

    console.log ( util.format ( '[%s] Client try to connect: %s:%s' , this.id , this.host , this.port ) );
    var self = this;
    this.state = STATE_CONNECTING;
    var socket = this.socket = net.connect( this.port , this.host );

    socket.on( 'connect' , this.onConnect );
    socket.on( 'error' , this.onError );
    socket.on( 'close' , this.onClose );
};

Client.prototype.onConnect = function() {
    util.log( '[%s]Client closed: %s:%d' , self.id , self.host , self.port );
    this.state = STATE_CONNECTED;
};

Client.prototype.onClose = function( e ) {
    util.log( '[%s]Client closed: %s:%d' , this.id , this.host , this.port );
    this.state = STATE_DISCONNECTED;

    if ( this.isStart )
    {
        setTimeout ( this.tryToConnect , this.retryConnectInterval );
    }
};

Client.prototype.onError = function( e ) {
    if ( e.code === 'ECONNREFUSED' )
    {
        self.state = STATE_DISCONNECTED;
//            process.nextTick ( self.tryToConnect() );
    }
    util.error ( '[%s] Client Error: %s' , this.id , e.code );
};

Client.prototype.setRetryConnectInterval = function ( interval ) {
    this.retryConnectInterval = interval;
};
