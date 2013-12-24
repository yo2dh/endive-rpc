var util = require( 'util' );
var hash = require( 'hashish' );

var RemoteInterface = function() {


};

module.exports = RemoteInterface;

RemoteInterface.prototype.setFunctions = function( functions ) {
    var self = this;
    hash( functions ).forEach( function( f , name ) {
        self[name] = f;
    });
};
