var erpc = require( './endive-rpc' );
var util = require( 'util' );

exports = module.exports = function( options ) {
    return new rpc( options );
};

util.inherits( rpc , erpc );
function rpc( options ) {
    var self = this;
    options = options || {};

    return erpc.call( self , options );
};