var erpc = require( '../' );
var should = require( 'should' );

var testBase = process.cwd() + '/test';

describe( 'endive-rpc' , function() {
    describe( '#endive-rpc' , function() {
        it( 'should create and get app' , function( done ) {
            var rpc = erpc();
            should.exist ( rpc );
            done();
        })
    });

    describe( '#listen-connect' , function() {
        it( 'should listen and connect' , function( done ) {
            var rs = erpc();
            var rc = erpc();

            rs.listen ( 3500 ).should.equal ( true );
            rc.connect ( '127.0.0.1' , 3500 ).should.equal ( true );


            done();
        })
    });
});