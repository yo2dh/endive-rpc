var util = require( 'util' );
var hash = require( 'hashish' );

var RemoteInterface = function( ownerListener ) {

    this.ownerListener = ownerListener || null;
    this.reqId = 0;
    this.map = {};
};

module.exports = RemoteInterface;

RemoteInterface.prototype.reset = function() {
    this.reqId = 0;
    this.map = {};
};

RemoteInterface.prototype.requestId = function() {
    var id = Math.random().toString( 16 ).slice ( 3 ) + '#' + this.reqId;
    this.reqId = (this.reqId + 1) % 10000;
    return id;
};

RemoteInterface.prototype.setFunctions = function( functionNames ) {
    var self = this;
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
                self.ownerListener.emit( 'functionCall' , requestId , requestDate , fname , args , cb );
            };
        })(name);
    }
};

RemoteInterface.prototype.removeRequest = function( requestId ) {
    var object = this.map[requestId];
    if ( object == null ) return null;

    delete this.map[requestId];
    return object;
};

RemoteInterface.prototype.responseFunctionInError = function( requestId ) {
    var object = this.removeRequest( requestId );
    if ( object == null ) return;

};

RemoteInterface.prototype.responseFunction = function( requestId , requestDate , returnValue ) {
    var object = this.removeRequest( requestId );
    if ( object == null ) return;

    if( object.date.toJSON() === requestDate )
    {
        var value = JSON.parse( returnValue ).value;

        if ( value == null )
        {
            object.cb();
        }
        else
        {
            var func = object.cb.toString();
            var argstring = func.substring( func.indexOf( '(' ) + 1 , func.indexOf( ')' ) - 1 );
            var args = argstring.split( ',' );
            var length = args.length;
            var inputArgs = [];
            var readyArgs = [ value ];
            var index = 0;
            var error = 'error';
            for( var i = 0 ; i < length ; i++ )
            {
                if( args[i].indexOf( '$error' ) >= 0 )
                {
                    inputArgs.push( error );
                }
                else
                {
                    inputArgs.push( readyArgs[index] );
                    index++;
                }
            }
            object.cb.apply( object , inputArgs );
        }
    }
    else
    {
        console.error( 'requestDate was different.' );
    }
};

RemoteInterface.prototype.garbageCollectionInMap = function() {
    var old = new Date();
//    old.setHours( old.getHours() - 1 ); // 1 hour
    old.setMinutes( old.getMinutes() - 10 ); // 10 minutes
    var map = this.map;
    hash( map ).forEach( function( object , key ) {
        if ( object.requestDate < old )
        {
            delete map[object.requestId];
        }
    });
};