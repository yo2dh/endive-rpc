var should = require( 'should' );
var AutoBuffer = require( '../../lib/buffer/autoBuffer' );
var testBase = process.cwd() + '/test';

describe( 'AutoBuffer' , function() {
    describe( '#AutoBuffer' , function() {
        it( 'should append and pop correctly' , function( done ) {

            var autoBuffer = new AutoBuffer ( 5 );
            var buf = new Buffer ( 8 );
            {
                for ( var i = 0 ; i < buf.length ; i++ )
                {
                    buf[i] = i;
                }
                for ( var j = 0 ; j < 10 ; j++ )
                {
                    autoBuffer.append( buf );
                }
            }
            var length = autoBuffer.getLength()
            var buffer = autoBuffer.getBuffer();
            {
                for ( var i = 0 ; i < length ; i ++ )
                {
                    buffer[i].should.equal( buf[i%8] );
                }
            }
            var newBuffer = new Buffer( 12 );
            autoBuffer.pop( newBuffer , 12 );
            {
                for ( var i = 0 ; i < 12 ; i++ )
                {
                    newBuffer[i].should.equal( buf[i%8] );
                }
            }
            length = autoBuffer.getLength()
            buffer = autoBuffer.getBuffer();
            for ( var i = 0 ; i < length ; i++ )
            {
                buffer[i].should.equal( buf[(i+12)%8] );
            }
            done();
         })
    });

});