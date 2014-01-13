
var hash = require( 'hashish' );
var util = require( 'endive-util' );
var utils = require( './../util/util')

var ConnectionManager = function() {

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
    connection.setConnectionManager( this );
    cons[connection.id] = connection;
};

ConnectionManager.prototype.removeAllConnection = function() {
    var cons = this.connections;
    var ids = Object.keys( cons );
    var length = ids.length;
    for( var i = 0 ; i < length ; i++ )
    {
        var con = cons[ids[i]];
        con.onClose();
    }
    this.connections = [];
};

ConnectionManager.prototype.closeAllConnection = function() {
    var cons = this.connections;
    var ids = Object.keys( cons );
    var length = ids.length;
    for( var i = 0 ; i < length ; i++ )
    {
        var con = cons[ids[i]];
        con.close();
    }
};

ConnectionManager.prototype.onCloseFromConnection = function( id ) {
    delete this.connections[id];
};

ConnectionManager.prototype.removeConnection = function( id ) {
    var connection = this.connections[id];
//    connection.();
    delete this.connections[id];
    return connection;
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
