var path = require( 'path' );
var AutoBuffer = require( './../buffer/autoBuffer' );
var ProtoBuf = require( 'protobufjs' );

var TYPE_FUNCTION_CALL  = 1;
var TYPE_JSON           = 2;

var Protocol = function( event )
{
    this.buffer = new AutoBuffer();
    this.owner = event;

    var dir = path.join( process.cwd() , 'protobuf' , 'functionCall.proto' );
    var builder = ProtoBuf.loadProtoFile( dir );

    this.FunctionCall = builder.build( 'FunctionCall' );
};

module.exports = Protocol;

Protocol.prototype.reset = function() {
    this.buffer.reset();
};

Protocol.prototype.formatFunctionCallPacket = function( requestId , requestDate , functionName , arguments ) {
    var functionCall = new this.FunctionCall( requestId , requestDate.toJSON() , functionName , arguments );
    return this.formatPacket( TYPE_FUNCTION_CALL , functionCall.toBuffer() , true );
};

Protocol.prototype.formatJsonPacket = function( data ) {
    return this.formatPacket( TYPE_JSON , data );
};

Protocol.prototype.formatPacket = function( type , data , isBuffer ) {
    isBuffer = isBuffer || false;
    var headerSize = 3; // UInt16 + UInt8

    var dataLength = data.length;
    var buffer = new Buffer( headerSize + dataLength );

    buffer.writeUInt16BE( dataLength , 0 );
    buffer.writeUInt8 ( type , 2 );

    if ( isBuffer )
    {
        data.copy ( buffer , 3 );
    }
    else
    {
        buffer.write( data , 3 );
    }
    return buffer;
};

Protocol.prototype.processPacket = function( packet ) {
    var buffer = this.buffer;

    buffer.append( packet );

    var headerSize = 3; // UInt16(length) + UInt8(type)
    var startIndex = 0;
    var processedLength = 0;
    var length = null;
    do
    {
        length = buffer.peakUInt16( startIndex );
        if ( length == null ) break;
        if ( buffer.length < (length + headerSize) ) break;

        var type = buffer.peakUInt8( startIndex + 2 );
        var oneBuffer = new Buffer( length );
        buffer.peak( oneBuffer , length , startIndex + headerSize );
        processedLength += (startIndex + headerSize + length);
        startIndex = processedLength;

        this.processOnePacket( type , oneBuffer );
    }
    while( (headerSize + startIndex) < buffer.length ) // UInt16 = 2 bytes

    buffer.remove( processedLength );
};

Protocol.prototype.processOnePacket = function( type , packet ) {
    switch( type )
    {
        case TYPE_FUNCTION_CALL:
        {
            var buffer = this.FunctionCall.decode( packet );
            this.owner.emit( 'functionCall' , buffer );
            break;
        }
        case TYPE_JSON:
        {
            this.owner.emit( 'jsonData' , packet );
            break;
        }
        default:
            assert( false );
    }

};
