var RemoteInterface = require( '../../lib/interface/remoteInterface' );
var path = require( 'path' );
var should = require( 'should' );

var testBase = process.cwd() + '/test';

describe( 'interface' , function() {
    describe( '#interface' , function() {
        it( 'should call functions' , function( done ) {
            var i = new RemoteInterface();
            i.setFunctions( {sum: function( a , b ) { return a + b; }} );
            i.sum( 1 , 2 ).should.equal( 3 );
            done();
        })
    });
});