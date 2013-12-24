var hash = require( 'hashish' );
var util = require( 'endive-util' );

var ConnectionManager = function() {

    this.anonymous = [];
    this.connections = {}; // id , connection
};

module.exports = ConnectionManager;

ConnectionManager.prototype.addConnection = function( connection ) {
    this.anonymous[connection.id] = connection;
};

ConnectionManager.prototype.removeConnection = function( id ) {
    var connection = this.connections[id];
    connection.stop();
    delete this.connections[id];
};

ConnectionManager.prototype.sendDataToAllConnection = function ( data ) {
    var sentCount = 0;
    hash( this.connections ).forEach( function( connection , id ) {
        connection.send ( data );
        sentCount ++;
    });

    return sentCount;
};

ConnectionManager.prototype.sendData = function ( id , data ) {
    var connection = this.connections[id];
    if ( connection == null )
    {
        util.error( '[%s] Failed to send data.' , id );
        return false;
    }
    connection.send( data );
    return true;
};

ConnectionManager.prototype.removeAnonymous = function ( c ) {
    var anonymous = this.anonymous;
    var length = anonymous.length;
    for ( var i = 0 ; i < length ; i++ ) {
        if ( anonymous[i] == c ) {
            c.close();
            anonymous.splice( i , 1 );
            break;
        }
    }
};

