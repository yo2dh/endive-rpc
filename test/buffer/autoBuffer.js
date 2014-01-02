var should = require( 'should' );
var AutoBuffer = require( '../../lib/buffer/autoBuffer' );
var testBase = process.cwd() + '/test';

describe( 'AutoBuffer' , function() {
    describe( '#Append&Pop' , function() {
        it( 'should append and pop correctly' , function( done ) {
            var size = 5;
            var autoBuffer = new AutoBuffer ( 5 );
            var buf = new Buffer ( size );
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
                    buffer[i].should.equal( buf[i%size] );
                }
            }
            var newBuffer = new Buffer( 12 );
            autoBuffer.pop( newBuffer , 12 );
            {
                for ( var i = 0 ; i < 12 ; i++ )
                {
                    newBuffer[i].should.equal( buf[i%size] );
                }
            }
            length = autoBuffer.getLength()
            buffer = autoBuffer.getBuffer();
            {
                for ( var i = 0 ; i < length ; i++ )
                {
                    var index = (i+12) % size;
                    buffer[i].should.equal( buf[index] );
                }
            }
            done();
         }),
        it( 'should pop and append correctly' , function( done ) {

            var autoBuffer = new AutoBuffer ( 5 );
            var buf = new Buffer ( 5 );
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
            var popBuffer = new Buffer( 5 );
            {
                var even = 0;
                for ( var i = 0 ; i < 20 ; i++ )
                {
                    autoBuffer.pop( popBuffer );
                    for ( var j = 0 ; j < popBuffer.length ; j++ )
                    {
                        popBuffer[j].should.equal( j % 5 );
                    }

                }
                autoBuffer.getLength().should.equal( 0 );
            }
            done();
        })
    });

});