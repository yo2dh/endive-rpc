var erpc = require( '../' );
var path = require( 'path' );
var should = require( 'should' );
var ProtoBuf = require( 'protobufjs' );

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