var utils = require( 'util' );
var path = require( 'path' );
var hash = require( 'hashish' );
var LocalInterface = require( './../interface/localInterface' );
var RemoteInterface = require( './../interface/remoteInterface' );
var AutoBuffer = require( './../buffer/autoBuffer' );
var ProtoBuf = require( 'protobufjs' );
var EventEmitter = require( 'events' ).EventEmitter;

var TYPE_FUNCTION_CALL      = 1;
var TYPE_RETURN_VALUES      = 2;
var TYPE_JSON               = 3;

var JTYPE_FUNCTION_NAMES    = 1;

var ERROR_CODE_NO_ERROR     = 0;
var ERROR_CODE_NO_FUNCTION  = 1;

var RETURN_TYPE_NUMBER      = 1;
var RETURN_TYPE_STRING      = 2;
var RETURN_TYPE_OBJECT      = 3;

var Protocol = function( ownerListener , localFunctions , localInterface )
{
    EventEmitter.call( this );

    this.buffer = new AutoBuffer();
    this.ownerListener = ownerListener;
    this.localInterface = null;
    if( localFunctions != null )
    {
        this.localInterface = new LocalInterface( ownerListener );
        this.localInterface.setFunctions( localFunctions );
    }
    else if( localInterface != null )
    {
        this.localInterface = localInterface;
    }
    this.remoteInterface = new RemoteInterface( this );

    this.isRemoteReady  = false;

    var self = this;
    this.on( 'functionCall' , function() {
        self.onFunctionCall.apply( self , arguments );
    });
    this.on( 'remoteFunctionCall' , function( buffer ) {
        self.onRemoteFunctionCall( buffer );
    });
    this.on( 'returnValues' , function( buffer ) {
        self.onRemoteReturnValues( buffer );
    });
    this.on( 'jsonData' , function( buffer ) {
        self.onRemoteJsonData( buffer );
    });
};

utils.inherits( Protocol , EventEmitter );

var builder = ProtoBuf.loadProtoFile( path.join( process.cwd() , 'protobuf' , 'functionCall.proto' ) );
ProtoBuf.loadProtoFile( path.join( process.cwd() , 'protobuf' , 'returnValues.proto' ) , builder );

Protocol.FunctionCall = builder.build( 'FunctionCall' );
Protocol.ReturnValues = builder.build( 'ReturnValues' );

module.exports = Protocol;

Protocol.prototype.reset = function() {
    this.buffer.reset();
};

Protocol.prototype.getRemoteInterface = function() {
    if ( this.isRemoteReady )
    {
        return this.remoteInterface;
    }
    return null;
};

Protocol.prototype.getLocalInterface = function() {
    return this.localInterface;
};

Protocol.formatFunctionCallPacket = function( requestId , requestDate , functionName , arguments ) {
    var fc = new Protocol.FunctionCall( requestId , requestDate.toJSON() , functionName , arguments );
    return Protocol.formatPacket( TYPE_FUNCTION_CALL , fc.toBuffer() , true );
};

Protocol.formatReturnValuesPacket = function( requestId , requestDate , errorCode , returnValues ) {
    var rv = new Protocol.ReturnValues( requestId , requestDate , errorCode , returnValues );
    return Protocol.formatPacket( TYPE_RETURN_VALUES , rv.toBuffer() , true );
};

Protocol.formatJsonPacket = function( json ) {
    if ( typeof json === 'object' )
    {
        json = JSON.stringify( json );
    }
    return Protocol.formatPacket( TYPE_JSON , json );
};

Protocol.formatPacket = function( type , data , isBuffer ) {
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

Protocol.prototype.onConnected = function() {
    var l = this.localInterface;
    if( l == null ) return;

    var names = l.getFunctionNames();
    var packet = Protocol.formatJsonPacket( { type: JTYPE_FUNCTION_NAMES , functionNames: names } );
    this.ownerListener.emit( 'send' , packet );
};

Protocol.prototype.onDisconnected = function() {
    this.remoteInterface.reset();
    this.setRemoteReady( false );
};

Protocol.prototype.setRemoteReady = function( flag ) {
    this.isRemoteReady = flag;
    if ( flag )
    {
        this.ownerListener.emit( 'remoteReady' , this.remoteInterface );
    }
    else
    {
        this.ownerListener.emit( 'remoteTerminated' );
    }
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
            var buffer = Protocol.FunctionCall.decode( packet );
            this.emit( 'remoteFunctionCall' , buffer );
            break;
        }
        case TYPE_RETURN_VALUES:
        {
            var buffer = Protocol.ReturnValues.decode( packet );
            this.emit( 'returnValues' , buffer );
            break;
        }
        case TYPE_JSON:
        {
            this.emit( 'jsonData' , packet );
            break;
        }
        default:
            assert( false );
    }
};

Protocol.prototype.onFunctionCall = function( requestId , requestDate , fname , args ) {
    if ( typeof args === 'object' )
    {
        args = JSON.stringify( args );
    }
    var p = Protocol.formatFunctionCallPacket( requestId , requestDate , fname , args );
    this.ownerListener.emit( 'send' , p );
};

Protocol.prototype.onRemoteFunctionCall = function( functionCall ) {
    var f = this.localInterface[functionCall.functionName];
    var p;
    if ( f === undefined )
    {
        p = Protocol.formatReturnValuesPacket( functionCall.requestId , functionCall.requestJsonDate , ERROR_CODE_NO_FUNCTION );
    }
    else
    {
        var jsonArgs = JSON.parse( functionCall.arguments );
        var args = [];
        hash( jsonArgs ).forEach( function( arg , key ) {
            args.push( arg );
        });

        var returnValues = { value: f.apply( this , args ) };
        if ( returnValues === undefined )
        {
            returnValues = null;
        }
        p = Protocol.formatReturnValuesPacket( functionCall.requestId , functionCall.requestJsonDate , ERROR_CODE_NO_ERROR , JSON.stringify( returnValues ) );
    }
    this.ownerListener.emit( 'send' , p );
};

Protocol.prototype.onRemoteReturnValues = function( returnValues ) {
    this.remoteInterface.responseFunction( returnValues.requestId , returnValues.requestJsonDate , returnValues.values );
};

Protocol.prototype.onRemoteJsonData = function( json ) {
    var object = JSON.parse( json );
    if ( object.type !== undefined &&
         object.type === JTYPE_FUNCTION_NAMES )
    {
        this.remoteInterface.setFunctions( object.functionNames );
        this.setRemoteReady( true );
        return;
    }
    this.ownerListener.emit( 'jsonObject' , object );
};

