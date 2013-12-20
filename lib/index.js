var erpc = require( './endive-rpc' );
var util = require( 'util' );
var hash = require( 'hashish' );
exports = module.exports = function( options ) {
    return new rpc( options );
};

util.inherits( rpc , erpc );
function rpc( options ) {
    var self = this;
    this.options = {
        clientInfoList: [] , // { ip , port }
        serverPort: null
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