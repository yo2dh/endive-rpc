var util = require( 'util' );
var hash = require( 'hashish' );

var LocalInterface = function( ownerListener ) {
    this.ownerListener = ownerListener || null;
};

module.exports = LocalInterface;

LocalInterface.prototype.setFunctions = function( functions ) {
    if ( functions == null ) return;

    var self = this;
    hash( functions ).forEach( function( f , key ) {
        self[key] = function() {
            var returnValue = f.apply( null , arguments );
            if ( self.ownerListener != null )
            {
                self.ownerListener.emit( 'returnValue' , returnValue );
            }
            return returnValue;
        };
    });
};

LocalInterface.prototype.getFunctionNames = function() {
    var self = this;
    var names = [];
    Object.keys( this ).forEach( function( name ) {
        if ( name != 'ownerListener' )
        {
            names.push( name );
        }
    });
    return names;
};