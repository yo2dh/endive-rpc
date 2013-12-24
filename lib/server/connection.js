var util = require( 'endive-util' );
var ProtoBuf = require( 'protobufjs' );
var path = require( 'path' );

var Connection = function( connection ) {

    var self = this;

    this.id = 'anonymous'
    this.connection = connection;

    var dir = path.join( process.cwd() , 'protobuf' , 'call.proto' );
    this.builder = ProtoBuf.loadProtoFile( dir );
    this.FunctionCall = this.builder.build( 'FunctionCall' );

    connection.on( 'data' , function( data ) {
        self.onReceived( data )
    });

    this.buffer = new Buffer( 10 );

    this.size = 0;
};

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

};

Connection.prototype.processPacket = function( data ) {

};