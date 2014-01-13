var util = require( 'util' );
var eutil = require( 'endive-util' );
var hash = require( 'hashish' );

var services = ['$errorCode'];

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
                var useService = false;
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
                        var funcargs = eutil.extractArguments( cb );
                        for( var j = 0 ; j < services.length ; j++ )
                        {
                            if ( funcargs.indexOf( services[j] ) >= 0 )
                            {
                                useService = true;
                                break;
                            }
                        }
                    }
                });
                var requestId = self.requestId();
                var requestDate = new Date();
                self.map[requestId] = { date: requestDate , cb: cb , useService: useService };
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

RemoteInterface.prototype.responseAllWithError = function( errorCode ) {
    var ids = Object.keys( this.map );
    var length = ids.length;
    for( var i = 0 ; i < length ; i++ )
    {
        var request = this.removeRequest( ids[i] );
        eutil.dynamicCall( request.cb , [ null ] , { '$errorCode': errorCode } );
    }
};

RemoteInterface.prototype.responseFunctionInError = function( requestId , errorCode ) {
    var request = this.removeRequest( requestId );
    if ( request == null ) return;

    eutil.dynamicCall( request.cb , [ null ] , { '$errorCode': errorCode } );
};

RemoteInterface.prototype.responseFunction = function( requestId , requestDate , returnValue ) {
    var request = this.removeRequest( requestId );
    if ( request == null ) return;

    if( request.date.toJSON() === requestDate )
    {
        var value = JSON.parse( returnValue ).value;

        if ( value == null )
        {
            request.cb();
        }
        else
        {
            if ( request.useService )
            {
                eutil.dynamicCall( request.cb , [ value ] , { '$errorCode': null } );
            }
            else
            {
                request.cb( value );
            }
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