var should = require( 'should' );
var Protocol = require( '../../lib/protocol/protocol' );
var hash = require( 'hashish' );
var EventEmitter = require('events').EventEmitter;
var RemoteInterface = require( '../../lib/interface/remoteInterface' );

var testBase = process.cwd() + '/test';
describe( 'Protocol' , function() {
    it( 'should format and process packets correctly' , function( done ) {
        var event = new EventEmitter();
        var protocol = new Protocol( event );

        var object = {
            data: 123 ,
            arg: 'abc'
        };
        var data = JSON.stringify( object );
        var packet = Protocol.formatJsonPacket( data );

        event.on( 'jsonObject' , function( json ) {
            ///console.log( protocolData.toString() );
            JSON.stringify( json ).should.equal( data );
            done();
        });

        protocol.processPacket( packet );

        setTimeout( function() {
            done( "'jsonObject' event didn't be called." );
        }, 200 );
    });

    it( 'should format and process a function-call packet correctly' , function( done ) {
        var prosEvent = new EventEmitter();
        var consEvent = new EventEmitter();

        var functions = {
            setData: function() {
                console.log( 'setData : ' + arguments );
            },
            sum: function( a , b ) {
                return (a + b);
            }
        };
        var prosProtocol = new Protocol( prosEvent , functions );
        var consProtocol = new Protocol( consEvent );

        prosEvent.on( 'send' , function( packet ) {
            process.nextTick( function() {
                consProtocol.processPacket( packet )
            });
        });
        consEvent.on( 'send' , function( packet ) {
            process.nextTick( function() {
                prosProtocol.processPacket( packet );
            });
        });
        consEvent.on( 'remoteReady' , function( i ) {
            i.setData( 123 , 456 , 'test' , ['a','b',3] , function( value ) {
                console.log( 'return Data' );
            });
            i.sum( 3 , 4 , function( value ) {
                value.should.equal( 7 );
                done();
            });
        });
        consEvent.on( 'returnValues' , function( returnValues ) {
            console.log( returnValues );
        });
        prosProtocol.onConnected();

//        prosProtocol.processPacket( packet );

        setTimeout( function() {
            done( "'send' or 'returnValues' event didn't be called." );
        }, 200 );
    });

});