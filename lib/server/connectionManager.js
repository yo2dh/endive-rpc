
var hash = require( 'hashish' );
var util = require( 'endive-util' );
var utils = require( './../util/util')

var ConnectionManager = function() {
    this.seqNo = 0;
    this.anonymous = [];
    this.connections = {}; // id , socket
};

module.exports = ConnectionManager;

ConnectionManager.prototype.generateId = function() {
    return utils.generateUniqueId( this.connections );
};

ConnectionManager.prototype.addConnection = function( connection ) {
    var cons = this.connections;
    if ( connection.id == null )
    {
        connection.id = utils.generateUniqueId ( cons );
    }
    cons[connection.id] = connection;
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

