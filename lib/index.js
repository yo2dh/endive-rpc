var erpc = require( './endive-rpc' );
var util = require( 'util' );
var hash = require( 'hashish' );
exports = module.exports = function( options ) {
    return new rpc( options );
};

exports.connect = function( host , port , id , ownerListener , functions ) {
    var e = new rpc( {
        clientInfoList: [{
            host: host ,
            port: port ,
            id: id ,
            ownerListener: ownerListener || e ,
            localFunctions: functions || null
        }] ,
        event: null
    });
    e.start();
    return e;
};

exports.listen = function( port , id , functions ) {
    id = id || 'no Id';
    var e = new rpc( { serverInfo: { port: port , id: id , functions: functions } } );
    e.start();
    return e;
};

util.inherits( rpc , erpc );
function rpc( options ) {
    var self = this;
    this.options = {
        clientInfoList: null , // [{ host , port , id }]
        serverInfo: null // // { port , id }
    };

    if ( options != null )
    {
        hash( options ).forEach( function( object , key ) {
            self.options[key] = object;
        });
    }

    this.getOption = function( key ) {
        return self.options[key];
    };

    return erpc.call( self );
};