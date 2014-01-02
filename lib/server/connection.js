var util = require( 'endive-util' );
var Protocol = require( '../protocol/protocol' );
var LocalInterface = require( '../interface/localInterface' );
var EventEmitter = require( 'events' ).EventEmitter;
var path = require( 'path' );

var Connection = function( connection , localInterface ) {

    EventEmitter.call( this );

    var self = this;

    this.id = 'anonymous'
    this.connection = connection;
    this.localInterface = localInterface;

    this.protocol = new Protocol( this );

    connection.on( 'data' , function( data ) {
        self.onReceived( data )
    });

    this.on( 'jsonData' , function( jsonData ) {
        self.onJsonData( jsonData );
    });
    this.on( 'functionCall' , function( functionCall ) {
        self.onFunctionCall( functionCall );
    });
};

utils.inherits( Connection, EventEmitter );

module.exports = Connection;

Connection.prototype.initProtoBuf = function() {
//    var builder = ProtoBuf.loadProtoFile(  dir );
//    var FunctionCall = builder.build( 'FunctionCall' );

};

Connection.prototype.send = function( data ) {
    var self = this;
    var c = this.connection;
    c.write( data , 'utf-8' , function() {
        self.onWritten();
    } );
};

Connection.prototype.onWritten = function( ) {
    util.log( '[%s] Connection data was written: %d' , this.id , arguments.length );
};

Connection.prototype.onReceived = function( data ) {
//    this.buffer.concat( data );
    util.log( '[%s] Connection data was received: [%d][%s]' , this.id , this.buffer.length , data );
    this.protocol.processPacket( data );
};

Connection.prototype.onJsonData = function( jsonData ) {
};

Connection.prototype.onFunctionCall = function( functionCall ) {
    this.localInterface[functionCall.functionName] ( functionCall.arguments );
    //functionCall.getFunctionName()
};
