var util = require( 'util' );
var hash = require( 'hashish' );

var LocalInterface = function( owner , event ) {
    this.event = event || null;
    this.owner = owner || event;
};

module.exports = LocalInterface;

LocalInterface.prototype.setFunctions = function( functions ) {
    var self = this;
    hash( functions ).forEach( function( f , key ) {
        self[key] = function() {
            var returnValue = f.apply( self.owner , arguments );
            if ( self.event != null )
            {
                self.event.emit( 'returnValue' , returnValue );
            }
            return returnValue;
        };
    });
};

