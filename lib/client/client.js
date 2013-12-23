var util = require( 'endive-util' );
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

    var self = this;
    util.log( '[%s] Client try to connect: %s:%s' , this.id , this.host , this.port );
    this.state = STATE_CONNECTING;
    var socket = this.socket = net.connect( this.port , this.host );

    socket.on( 'connect' , function() {
        util.log( '[%s] Client connected: %s:%d' , self.id , self.host , self.port );
        this.state = STATE_CONNECTED;
    });

    socket.on( 'error' , function( e ) {
        if ( e.code === 'ECONNREFUSED' )
        {
            self.state = STATE_DISCONNECTED;
//            process.nextTick ( self.tryToConnect() );
        }
        util.error( '[%s] Client error: %s' , self.id , e.code );
    });
    socket.on( 'data' , function( data ) {
        util.log( '[%s] Connection data was received: %d' , self.id , arguments.length );

    });
    socket.on( 'close' , function( e ) {
        util.log( '[%s] Client closed: %s:%d' , self.id , self.host , self.port );
        self.state = STATE_DISCONNECTED;

        if ( self.isStart )
        {
            setTimeout( self.tryToConnect , self.retryConnectInterval );
        }
    });
};

Client.prototype.setRetryConnectInterval = function ( interval ) {
    this.retryConnectInterval = interval;
};


Client.prototype.send = function( data ) {
    var c = this.socket;
    c.write( data , 'utf-8' , function( ) {
        util.log( '[%s] Connection data was written: %d' , self.id , arguments.length );
    });
};
