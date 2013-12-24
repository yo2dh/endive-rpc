var net = require( 'net' );
var util = require( 'endive-util' );
var utils = require( '../util/util')
var Connection = require( './connection' );
var ConnectionManager = require( './connectionManager' );

var STATE_CLOSED = 0;
var STATE_LISTEN = 1;

var Server = function ( serverInfo ) {
    this.id = serverInfo.id || null;
    this.port = serverInfo.port || null;
    this.server = null;

    this.state = STATE_CLOSED;

    this.connectionManager = new ConnectionManager();
};

module.exports = Server;

Server.prototype.listen = function() {
    if ( this.port == null )
    {
        util.error( '[%s] Server port was not set.' , this.id );
        return;
    }
    if ( this.state === STATE_LISTEN )
    {
        util.log( '[%s] Server already listened: %d' , this.id , this.port );
        return;
    }

    var self = this;
    socket = net.createServer ( function( socket ) {
        var connection = new Connection( socket );

        self.connectionManager.addConnection( 'testid' , connection );
        util.log( '[%s] Server accepted connection: %s:%d' , self.id , socket.remoteAddress , socket.remotePort );
    });

    socket.listen( this.port , function() {
        util.log( '[%s] Server started listening: %d' , self.id , self.port );
    });

    this.state = STATE_LISTEN;
};

Server.prototype.close = function() {
    if ( this.state === STATE_CLOSED ) return;

    var self = this;
    socket.close( function() {
        util.log( '[%s] Server was closed: %d' , self.id , self.port );
    });
    socket = null;
    this.state = STATE_CLOSED;
};

Server.prototype.onConnection = function( socket ) {
    var connection = new Connection( socket );

    this.connectionManager.addConnection( 'testid' , connection );
    util.log( '[%s] Server accepted connection: %s:%d' , this.id , socket.remoteAddress , socket.remotePort );
};