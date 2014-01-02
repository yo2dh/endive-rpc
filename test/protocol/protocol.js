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
        var packet = protocol.formatJsonPacket( data );

        event.on( 'jsonData' , function( json ) {
            ///console.log( protocolData.toString() );
            json.toString().should.equal( data );
            done();
        });

        protocol.processPacket( packet );

        setTimeout( function() {
            done( "'jsonData' event didn't be called." );
        }, 200 );
    });

    it( 'should format and process a function-call packet correctly' , function( done ) {
        var event = new EventEmitter();
        var protocol = new Protocol( event );

        var farguments = { a:'123' , b:'22' , c:4 , d:[3,2,'3'] };
        var packet = protocol.formatFunctionCallPacket( '323#1' , 'setData' , JSON.stringify( farguments ) );

        event.on( 'functionCall' , function( functionCall ) {
            console.log( functionCall );
            functionCall.functionName.should.equal( 'setData' );
            var object = JSON.parse( functionCall.arguments );
            hash( object ).forEach( function( value , key ) {
                if ( value instanceof Array )
                {
                    var compare = farguments[key];
                    for( var i = 0 ; i < value.length ; i++ )
                    {
                        value[i].should.equal( compare[i] );
                    }
                }
                else
                {
                    value.should.equal( farguments[key] );
                }
            });
            done();
        });

        protocol.processPacket( packet );

        setTimeout( function() {
            done( "'functionCall' event didn't be called." );
        }, 200 );
    });

    it( 'should format and process a function-call packet using RemoteInterface' , function( done ) {
        var event = new EventEmitter();
        var protocol = new Protocol( event );

        var functions = {
            sum: function( a , b ) {
                return (a+b);
            }
        };
        var remoteFunctions = {
            sum: function() {

            }
        };

        var ri = new RemoteInterface( functions );

        var farguments = { a:'123' , b:'22' , c:4 , d:[3,2,'3'] };
        var packet = protocol.formatFunctionCallPacket( '323#1' , 'setData' , JSON.stringify( farguments ) );

        event.on( 'functionCall' , function( functionCall ) {
            console.log( functionCall );
            functionCall.functionName.should.equal( 'setData' );
            var object = JSON.parse( functionCall.arguments );
            hash( object ).forEach( function( value , key ) {
                if ( value instanceof Array )
                {
                    var compare = farguments[key];
                    for( var i = 0 ; i < value.length ; i++ )
                    {
                        value[i].should.equal( compare[i] );
                    }
                }
                else
                {
                    value.should.equal( farguments[key] );
                }
            });
            done();
        });

        protocol.processPacket( packet );

        setTimeout( function() {
            done( "'functionCall' event didn't be called." );
        }, 200 );
    });
});