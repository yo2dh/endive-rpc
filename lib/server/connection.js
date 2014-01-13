var util = require( 'endive-util' );
var utils = require( 'util' );
var Protocol = require( '../protocol/protocol' );
var LocalInterface = require( '../interface/localInterface' );
var EventEmitter = require( 'events' ).EventEmitter;
var path = require( 'path' );

var Connection = function( ownerListener , id , socket , localInterface ) {

    EventEmitter.call( this );

    var self = this;

    this.id = id;
    this.socket = socket;
    this.ownerListener = ownerListener;
    this.connectionManager = null;

    this.protocol = new Protocol( this , localInterface );
    socket.on( 'data' , function( data ) {
        self.onReceivedData( data )
    });
    socket.on( 'end' , function() {
        self.onClose();
    });
    this.on( 'remoteReady' , function( i ) {
        self.ownerListener.emit( 'remoteReady' , i , this );
    });
    this.on( 'remoteTerminated' , function( i ) {
        self.ownerListener.emit( 'remoteTerminated' , i , this );
    });
    this.on( 'send' , function( data ) {
        self.send ( data );
    });

    this.protocol.onConnected();
};

utils.inherits( Connection, EventEmitter );

module.exports = Connection;

Connection.prototype.setConnectionManager = function( cm ) {
    this.connectionManager = cm;
};

Connection.prototype.getInterface = function() {
    return this.protocol.getRemoteInterface();
};

Connection.prototype.send = function( data ) {
    var self = this;
    (function( length ) {
        self.socket.write( data , 'utf-8' , function() {
            self.onWritten( length );
        });
    })( data.length );
};

Connection.prototype.onWritten = function( length ) {
    util.log( '[%s] Connection data was written: %d' , this.id , length );
};

Connection.prototype.onReceivedData = function( data ) {
//    this.buffer.concat( data );
    util.log( '[%s] Connection data was received: [%d]' , this.id , data.length );
    this.protocol.processPacket( data );
};

Connection.prototype.onClose = function() {
    this.connectionManager.onCloseFromConnection( this.id );
    this.protocol.onDisconnected();
};

Connection.prototype.close = function() {
    this.socket.destroy();
};