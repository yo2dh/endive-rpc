var util = require( 'util' );
var erpc = require( '../' );
var path = require( 'path' );
var should = require( 'should' );
var ProtoBuf = require( 'protobufjs' );
var EventEmitter = require('events').EventEmitter;

var testBase = process.cwd() + '/test';

describe( 'endive-rpc' , function() {
    describe( '#error' , function() {
        it( 'should receive internal errors when calling the result function.' , function( done ) {
            var crpc = erpc().connect( '127.0.0.1' , 3800 , 'client' );
            var srpc = erpc({
                sum: function( a , b ) { return a+b; } ,
                mul: function( a , b ) { return a*b; }
            }).listen( 3800 , 'server' );
            var count = 0;
            var stops = function() {
                if ( count == 2 )
                {
                    crpc.stop();
                    done();
                }
            };

            crpc.on( 'remoteReady' , function( i ) {
                i.sum( 3 , 4 , function( result , $error ) {
                    result.should.equal( 7 );
                    $error.should.equal( 'error' );
                    count ++;
//                    srpc.stop();
                    stops();
                });
                i.mul( 5, 7 , function( $error , result ) {
                    result.should.equal( 35 );
                    $error.should.equal( 'error' );
                    count ++;
                    stops();
                });
            });

            setTimeout( function() {
                crpc.stop();
                srpc.stop();
                done( 'timeout');
            }, 100 );
        })
    });
});