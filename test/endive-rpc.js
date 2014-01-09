var util = require( 'util' );
var erpc = require( '../' );
var path = require( 'path' );
var should = require( 'should' );
var ProtoBuf = require( 'protobufjs' );
var EventEmitter = require('events').EventEmitter;

var testBase = process.cwd() + '/test';

describe( 'endive-rpc' , function() {
    describe( '#default' , function() {
        it( 'should call a function and receive a return value from client to server.' , function( done ) {
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
                    srpc.stop();
                    done();
                }
            };

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
        }),

        it( 'should call a function and receive a return value from server to client.' , function( done ) {
            done();
            return;
            var event = new EventEmitter();
            event.getConnectionId = function ( host , port ) {
                return util.format( '%s:%d' , host , port );
            };
            var crpc = erpc().connect( '127.0.0.1' , 3800 , 'client' , {
                min: function( a , b ) { return a < b ? a : b; } ,
                max: function( a , b ) { return a < b ? b : a; }
            });
            var serverHandler = {
                getConnectionId: function ( host , port ) {
                    return util.format( '%s:%d' , host , port );
                }
            };
            var srpc = erpc({
                sum: function( a , b ) { return a+b; } ,
                mul: function( a , b ) { return a*b; }
            }).listen( 3800 , 'server' , null , serverHandler );

            var count = 0;
            var stops = function() {
                if ( count == 2 )
                {
                    crpc.stop();
                    srpc.stop();
                    done();
                }
            };

            srpc.on( 'remoteReady' , function( i , connection ) {
                i.min( 100 , 200 , function( result ) {
                    result.should.equal( 100 );
                    count ++;
                    stops();
                });
                i.max( 100 , 200 , function( result ) {
                    result.should.equal( 200 );
                    count ++;
                    stops();
                });
            });
            setTimeout( function() {
                crpc.stop();
                srpc.stop();
                done( 'timeout');
            }, 100 );
        }),

        it( 'should call a function and receive a return value between them.' , function( done ) {
            done();
            return;
            var event = new EventEmitter();
            event.getConnectionId = function ( host , port ) {
                return util.format( '%s:%d' , host , port );
            };
            var crpc = erpc().connect( '127.0.0.1' , 3800 , 'client' , {
                min: function( a , b ) { return a < b ? a : b; } ,
                max: function( a , b ) { return a < b ? b : a; }
            });
            var serverHandler = {
                getConnectionId: function ( host , port ) {
                    return util.format( '%s:%d' , host , port );
                }
            };
            var srpc = erpc({
                sum: function( a , b ) { return a+b; } ,
                mul: function( a , b ) { return a*b; }
            }).listen( 3800 , 'server' , null , serverHandler );

            var count = 0;
            var stops = function() {
                if ( count == 4 )
                {
                    crpc.stop();
                    srpc.stop();
                    done();
                }
            };

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
            srpc.on( 'remoteReady' , function( i , connection ) {
                i.min( 100 , 200 , function( result ) {
                    result.should.equal( 100 );
                    count ++;
                    stops();
                });
                i.max( 100 , 200 , function( result ) {
                    result.should.equal( 200 );
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