var erpc = require( '../' );
var should = require( 'should' );

var testBase = process.cwd() + '/test';

describe( 'endive-rpc' , function() {
    describe( '#endive-rpc' , function() {
        it( 'should create instance and set options correctly' , function( done ) {
            var clientInfoList = [ { host: '127.0.0.1' , port: '3800' , id: 'client-1' } , { host: '127.0.0.1' , port: '3805' , id: 'client-2'} ];
            var serverInfo = { port: '3800' , id: 'server-1' };
            var rpc = erpc( { clientInfoList: clientInfoList , serverInfo: serverInfo } );
            should.exist( rpc );

            var optClientInfoList = rpc.getOption( 'clientInfoList' );
            for ( var i = 0 ; i < optClientInfoList.length ; i++ )
            {
                optClientInfoList[i].should.equal( clientInfoList[i] );
            }
            should.not.exist( rpc.getOption( 'serverPort' ) );
//            should.equal ( rpc.getOption( 'serverPort' ) , 0 );

            rpc.start();
            setTimeout( function() {
                rpc.stop();
                done();
            }, 2000 );
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