var crypto = require( 'crypto' );

// http://stackoverflow.com/questions/9407892/how-to-generate-random-sha1-hash-to-use-as-id-in-node-js
module.exports.uniqueId = function() {
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    crypto.createHash('sha1').update(current_date + random).digest('hex');
};

module.exports.generateUniqueId = function( container ) {
    var id = null;
    do
    {
        id = this.uniqueId();
    }
    while ( container[id] != null );

    return id;
};

function hasProperty ( object , property ) {
    if ( object == null ) return false;
    return object.hasOwnProperty( property );
};

module.exports.hasProperty = hasProperty;

module.exports.callHandler = function() {
    // handler , handlerFunctionName , arguments
    var handler = arguments[0];
    var functionName = arguments[1];
    if ( hasProperty ( handler , functionName ) == false ) return null;

    var args = [];
    for ( var i = 2 ; i < arguments.length ; i++ )
    {
        args.push( arguments[i] );
    }
    return handler[functionName].apply( handler , args );
};
