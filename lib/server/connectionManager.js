var hash = require( 'hashish' );
var util = require( 'endive-util' );

var ConnectionManager = function() {

    this.connections = {}; // id , connection
};

module.exports = ConnectionManager;

ConnectionManager.prototype.addConnection = function( id , connection ) {
    this.connections[id] = connection;
};

ConnectionManager.prototype.removeConnection = function( id ) {
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