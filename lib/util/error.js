var exports = module.exports;

function define( name , value ) {
    Object.defineProperty( exports , name , {
        value: value ,
        enumerable: true
    });
};

define( 'NO_ERROR' , 0 );
define( 'SOCKET_CLOSED' , -1 );

module.exports.errorMessage = function( errorCode ) {
    switch( errorCode )
    {
        case exports.NO_ERROR: return 'No Error';
        case exports.SOCKET_CLOSED: return 'The socket was closed.';
        default: return 'Unknown ErrorCode: ' + errorCode;
    }
};