var util = require( 'util' );
var erpc = require( '../' );
var path = require( 'path' );
var should = require( 'should' );
var ProtoBuf = require( 'protobufjs' );
var EventEmitter = require('events').EventEmitter;
var error = require( '../lib/util/error' );
var testBase = process.cwd() + '/test';

describe( 'endive-rpc' , function() {
    describe( '#error' , function() {
        it( 'should receive internal errors when calling the result function.' , function( done ) {
            var crpc = erpc().connect( '127.0.0.1' , 3800 , 'client' );
            var srpc = erpc({
                sum: function( a , b ) { return a+b; } ,
                mul: function( a , b ) { return a*b; }
            }).listen( 3800 , 'server' );
            var timer = setTimeout( function() {
                crpc.stop();
                srpc.stop();
                done( 'timeout');
            }, 3000 );
            var count = 0;
            var stops = function() {
                if ( count == 2 )
                {
                    crpc.stop();
                    clearTimeout( timer );
                    done();
                }
            };

            crpc.on( 'remoteReady' , function( i ) {
                setTimeout( function() {
                    i.sum( 3 , 4 , function( result , $errorCode ) {
                        should.not.exist( result );
                        should.exist( $errorCode );
                        console.log( 'error: ' + error.errorMessage( $errorCode ) );
                        count ++;
                        stops();
                    });
                } , 10 );
                i.mul( 5, 7 , function( $errorCode , result ) {
                    result.should.equal( 35 );
                    should.not.exist( $errorCode );
                    count ++;
                    srpc.stop();
                    stops();
                });
            });

        })
    });
});