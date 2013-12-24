var ClientManager = require( '../../lib/client/clientManager' );
var Server = require( '../../lib/server/server' );

var path = require( 'path' );
var should = require( 'should' );
var ProtoBuf = require( 'protobufjs' );
//var Buffer = require( 'buffer' );
var testBase = process.cwd() + '/test';

describe( 'client-server' , function() {
    describe( '#send-receive' , function() {
        it( 'should send and receive correctly' , function( done ) {

            var buf = new Buffer ( 8 );
            for ( var i = 0 ; i < buf.length ; i++ )
            {
                buf[i] = i;
            }

            console.log( buf );
            buf.copy( buf , 0 , 3 , buf.length );
            console.log( buf );
            done();
            /*
            return;

            var cm = new ClientManager( [{ host: '127.0.0.1' , port: '3800' , id: 'client-1' }] );
            var server = new Server( { port: '3800' , id: 'server-1' } );

            server.listen();
            cm.start();

            var dir = path.join( process.cwd() , 'protobuf' , 'call.proto' );
            var builder = ProtoBuf.loadProtoFile(  dir );
            var FunctionCall = builder.build( 'FunctionCall' );
            var arguments = { a:'123' , b:'22' , c:4 , d:[3,2,'3'] };
            var f = new FunctionCall ( 'int' , 'test' , JSON.stringify( arguments ) );

            var buffer = f.toBuffer();
            var c = cm.getClient( 'client-1' );

            for( var i = 0 ; i < 1000 ; i++ )
            {
//                setTimeout ( function() {
                process.nextTick ( function() {
                    c.send( buffer );
                });
  //              } , 1 );
            }
            setTimeout( function() {
                cm.stop();
                server.close();
                console.log( 'length = ' + (i * data.length) );
                done();
            }, 5000 );
            */
        })
    });

});