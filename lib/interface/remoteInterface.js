var util = require( 'util' );
var hash = require( 'hashish' );

var RemoteInterface = function( owner , event ) {

    this.owner = owner || null;
    this.event = event || owner;
    this.reqId = 0;
    this.map = {};
    this.functionsNames = null;
};

module.exports = RemoteInterface;

RemoteInterface.prototype.requestId = function() {
    var id = Math.random().toString( 16 ).slice ( 3 ) + '#' + this.reqId;
    this.reqId = (this.reqId + 1) % 10000;
    return id;
};

RemoteInterface.prototype.setFunctions = function( functionNames ) {
    var self = this;
    this.functionsNames = functionNames;
    var length = functionNames.length;
    for( var i = 0 ; i < length ; i++ )
    {
        var name = functionNames[i];
        (function(fname) {
            self[fname] = function() {
                var args = {};
                var cb = null;
                hash( arguments ).forEach( function( value , key ) {
                    if ( typeof value != 'function' )
                    {
                        args[key] = value;
                    }
                    else
                    {
                        cb = value;
                    }
                });
                var requestId = self.requestId();
                var requestDate = new Date();
                self.map[requestId] = { date: requestDate , cb: cb };
                self.owner.emit( 'functionCall' , requestId , requestDate , fname , args , cb );
            };
        })(name);
    }
};

RemoteInterface.prototype.responseFunction = function( requestId , requestDate , returnValue ) {
    var object = this.map[requestId];
    if ( object == null ) return;

    if( object.date != new Date( requestDate ) )
    {
        throw new Error( 'requestDate was different.' );
    }
    delete this.map[requestId];
    object.cb.apply( this.owner , returnValue );

};