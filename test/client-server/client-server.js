var ClientManager = require( '../../lib/client/clientManager' );
var Server = require( '../../lib/server/server' );
var EventEmitter = require('events').EventEmitter;

var path = require( 'path' );
var should = require( 'should' );
var ProtoBuf = require( 'protobufjs' );
//var Buffer = require( 'buffer' );
var testBase = process.cwd() + '/test';

describe( 'client-server' , function() {
    it( 'should call a remote function and receive return values about it' , function( done ) {
        var event = new EventEmitter();
        var functions = {
            sum: function( a , b ) {
                return (a + b);
            }
        };
        var cm = new ClientManager( {
            clientInfoList: [
                {
                    ownerListener: event ,
                    host: '127.0.0.1' ,
                    port: '3800' ,
                    id: 'client-1'
                }] ,
            event: null
        });
        var server = new Server( { port: '3800' , id: 'server-1' , functions: functions , ownerListener: null } );

        server.listen();
        cm.start();

        var c = cm.getClient( 'client-1' );
        event.on( 'remoteReady' , function( i ) {
            i.sum( 3 , 4 , function( value ) {
                value.should.equal( 7 );
                cm.stop();
                server.close();
                done();
            });
        });
        setTimeout( function() {
            cm.stop();
            server.close();
            done( 'error' );
        }, 200 );
    })
});