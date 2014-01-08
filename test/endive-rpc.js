var util = require( 'util' );
var erpc = require( '../' );
var path = require( 'path' );
var should = require( 'should' );
var ProtoBuf = require( 'protobufjs' );
var EventEmitter = require('events').EventEmitter;

var testBase = process.cwd() + '/test';

describe( 'endive-rpc' , function() {
    describe( '#default' , function() {
        it( 'should connect and call a function correctly' , function( done ) {
            var crpc = erpc().connect( '127.0.0.1' , 3800 , 'client' );
            var srpc = erpc().listen( 3800 , 'server' , {
                sum: function( a , b ) { return a+b; } ,
                mul: function( a , b ) { return a*b; }
            });
            var stops = function() {
                crpc.stop();
                srpc.stop();
                done();
            };

            var count = 0;
            crpc.on( 'remoteReady' , function( i ) {
                i.sum( 3 , 4 , function( result ) {
                    result.should.equal( 7 );
                    count ++;
                    if ( count == 2 )
                    {
                        stops();
                    }
                });
                i.mul( 5, 7 , function( result ) {
                    result.should.equal( 35 );
                    count ++;
                    if ( count == 2 )
                    {
                        stops();
                    }
                });
            });

            setTimeout( function() {
                crpc.stop();
                srpc.stop();
                done( 'timeout');
            }, 100 );
        }),

        it( 'should connect and call a function correctly' , function( done ) {
            var event = new EventEmitter();
            event.getConnectionId = function ( host , port ) {
                return util.format( '%s:%d' , host , port );
            };
            var crpc = erpc().connect( '127.0.0.1' , 3800 , 'client' , {
                min: function( a , b ) { return a < b ? a : b; } ,
                max: function( a , b ) { return a < b ? b : a; }
            });
            var srpc = erpc({
                sum: function( a , b ) { return a+b; } ,
                mul: function( a , b ) { return a*b; }
            }).listen( 3800 , 'server' );

            var count = 0;
            var stops = function() {
                if ( count == 2 )
                {
                    crpc.stop();
                    srpc.stop();
                    done();
                }
            };
            var serverHandler = {
                  getConnectionId: function ( host , port ) {
                      return util.format( '%s:%d' , host , port );
                  }
            };
            srpc.setHandler( serverHandler );

            crpc.on( 'remoteReady' , function( i ) {
                i.sum( 3 , 4 , function( result ) {
                    result.should.equal( 7 );
                    count ++;
                    stops();
                });
                i.mul( 5, 7 , function( result ) {
                    result.should.equal( 35 );
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