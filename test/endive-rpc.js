var erpc = require( '../' );
var path = require( 'path' );
var should = require( 'should' );
var ProtoBuf = require( 'protobufjs' );

var testBase = process.cwd() + '/test';

describe( 'endive-rpc' , function() {
    describe( '#endive-rpc' , function() {
        it( 'should create instance and set options correctly' , function( done ) {
            var clientInfoList = [ { host: '127.0.0.1' , port: '3800' , id: 'client-1' } , { host: '127.0.0.1' , port: '3805' , id: 'client-2'} ];
            var serverInfo = { port: '3800' , id: 'server-1' };
            var rpc = erpc( { clientInfoList: clientInfoList , serverInfo: serverInfo } );
            should.exist( rpc );

            var optClientInfoList = rpc.getOption( 'clientInfoList' );
            for ( var i = 0 ; i < optClientInfoList.length ; i++ )
            {
                optClientInfoList[i].should.equal( clientInfoList[i] );
            }
            should.not.exist( rpc.getOption( 'serverPort' ) );
//            should.equal ( rpc.getOption( 'serverPort' ) , 0 );

            rpc.start();
            setTimeout( function() {
                rpc.stop();
                done();
            }, 2000 );
        })
    });

    describe( '#test-protobuf' , function() {
        it( 'should load a proto file.' , function( done ) {
            var dir = path.join( process.cwd() , 'protobuf' , 'functionCall.proto' );
            console.log( dir );
            var builder = ProtoBuf.loadProtoFile(  dir );
            var FunctionCall = builder.build( 'FunctionCall' );
            var arguments = { a:'123' , b:'22' , c:4 , d:[3,2,'3'] };
            var f = new FunctionCall ( 'int' , 'test' , JSON.stringify( arguments ) );
            var testFunction = function(a , b , c , d) {
                console.log( arguments );
                console.log( arguments.length );
            }
            testFunction( 3 , 4 , 5 , 'a' )
            /*
            var encoded = f.encode();
            console.log( 'encoded: ' + encoded + ', string length = ' + JSON.stringify ( f ).length );
            var buffer = f.toArrayBuffer();
            console.log( 'buffer:' );
            console.log( buffer );
            console.log( 'FunctionCall.decode( encoded ):' );
            var fr = FunctionCall.decode( encoded );
            console.log( fr );
            fr = FunctionCall.decode( buffer );
            console.log( 'FunctionCall.decode( buffer ):' );
            console.log( fr );
            */
            // OR: As a base64 encoded string...
            //var b64str = myMessage.toBase64(); // (*)
            // myMessage.decode64( b64str );
            /*
             try {
             var myMessage = YourMessage.decode(bufferWithMisstingRequiredField);
             ...
             } catch (e) {
             if (e.decoded) { // Truncated
             myMessage = e.decoded; // Decoded message with missing required fields
             ...
             } else { // General error
             ...
             }
             }
             */
            done();
        })
    });
    describe( '#listen-connect' , function() {
        it( 'should listen and connect' , function( done ) {
//            var rs = erpc ( );
//            var rc = erpc();
//
//            var s = rs.listen ( 3500 );
//            s.should.equal ( true );
//            rc.connect ( '127.0.0.1' , 3500 ).should.equal ( true );


            done();
        })
    });
});