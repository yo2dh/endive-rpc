var util = require( 'endive-util' );
var utils = require( 'util' );
var Protocol = require( '../protocol/protocol' );
var LocalInterface = require( '../interface/localInterface' );
var EventEmitter = require( 'events' ).EventEmitter;
var path = require( 'path' );

var Connection = function( id , connection , localInterface ) {

    EventEmitter.call( this );

    var self = this;

    this.id = id;
    this.connection = connection;

    this.protocol = new Protocol( this , null , localInterface );
    connection.on( 'data' , function( data ) {
        self.onReceivedData( data )
    });

    this.on( 'send' , function( data ) {
        self.onSend ( data );
    });

    this.protocol.onConnected();
};

utils.inherits( Connection, EventEmitter );

module.exports = Connection;

Connection.prototype.getInterface = function() {
    return this.protocol.getRemoteInterface();
};

Connection.prototype.send = function( data ) {
    var self = this;
    var c = this.connection;
    c.write( data , 'utf-8' , function() {
        self.onWritten();
    });
};

Connection.prototype.onWritten = function( ) {
    util.log( '[%s] Connection data was written: %d' , this.id , arguments.length );
};

Connection.prototype.onReceivedData = function( data ) {
//    this.buffer.concat( data );
    util.log( '[%s] Connection data was received: [%d]' , this.id , data.length );
    this.protocol.processPacket( data );
};

Connection.prototype.onSend = function( data ) {
    this.send ( data );
};
