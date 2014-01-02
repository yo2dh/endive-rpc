var LocalInterface = require( '../../lib/interface/localInterface' );
var RemoteInterface = require( '../../lib/interface/remoteInterface' );
var EventEmitter = require('events').EventEmitter;
var path = require( 'path' );
var should = require( 'should' );
var hash = require( 'hashish' );

var testBase = process.cwd() + '/test';

describe( 'interface' , function() {
    describe( '#LocalInterface' , function() {
        it( 'should call a function' , function( done ) {
            var event = new EventEmitter();

            var i = new LocalInterface( event , event );
            var functions = {sum: function( a , b ) { return a + b; }};
            i.setFunctions( functions );
            i.sum( 1 , 2 ).should.equal( 3 );
            done();
        })
    });
    describe( '#RemoteInterface' , function() {
        it( 'should call a remote function' , function( done ) {
            var event = new EventEmitter();
            var i = new RemoteInterface( event );
            var functions = [ 'sum' , 'setData' ];
            i.setFunctions( functions );
            var object = { sum: function( a , b ) { return a + b; } };

            event.on( 'functionCall' , function( requestId , requestDate , fname , args , cb ) {
                console.log( arguments );
                var aargs = [];
                hash( args ).forEach( function( value , key ) {
                    aargs.push( value );
                });
                cb ( object[fname].apply ( object , aargs ) );
            });
            i.sum( 1 , 2 , function( result ) {
                result.should.equal( 3 );
                console.log( result );
                done();
            });

        })
    });

});