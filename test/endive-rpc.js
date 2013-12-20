var erpc = require( '../' );
var should = require( 'should' );

var testBase = process.cwd() + '/test';

describe( 'endive-rpc' , function() {
    describe( '#endive-rpc' , function() {
        it( 'should create instance and set options correctly' , function( done ) {
            var clientInfoList = [ { ip: '127.0.0.1' , port: '3800' } , { ip: '127.0.0.1' , port: '3805' } ];
            var rpc = erpc( { clientInfoList: clientInfoList } );
            should.exist( rpc );

            var optClientInfoList = rpc.getOption( 'clientInfoList' );
            for ( var i = 0 ; i < optClientInfoList.length ; i++ )
            {
                optClientInfoList[i].should.equal( clientInfoList[i] );
            }
            should.not.exist( rpc.getOption( 'serverPort' ) );
//            should.equal ( rpc.getOption( 'serverPort' ) , 0 );

            rpc.start();

            setTimeout( done , 3000 );
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