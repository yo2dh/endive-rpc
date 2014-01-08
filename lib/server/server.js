var net = require( 'net' );
var util = require( 'endive-util' );
var utils = require( '../util/util')
var Connection = require( './connection' );
var ConnectionManager = require( './connectionManager' );
var LocalInterface = require( './../interface/localInterface' );

var STATE_CLOSED = 0;
var STATE_LISTEN = 1;

var Server = function ( serverInfo ) {
    this.id = serverInfo.id || null;
    this.port = serverInfo.port || null;
    this.localInterface = null;
    this.ownerListener = serverInfo.ownerListener;

    var functions = serverInfo.functions;
    if( functions != null )
    {
        this.localInterface = new LocalInterface( serverInfo.ownerListener );
        this.localInterface.setFunctions( functions );
    }

    this.server = null;

    this.state = STATE_CLOSED;

    this.connectionManager = new ConnectionManager();

    if( this.ownerListener && this.ownerListener['getConnectionId'] == null )
    {
        console.warn( 'It will set the random id to a connection because ownerListener has no "getConnectionId".' );
    }
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
        self.onConnection ( socket );
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
    var cm = this.connectionManager;
    var id = null;
    if ( this.ownerListener == null || this.ownerListener['getConnectionId'] == null )
    {
        id = cm.generateId();
    }
    else
    {
        id = this.ownerListener.getConnectionId( socket.remoteAddress , socket.remotePort , socket );
    }

    var connection = new Connection( id , socket , this.localInterface );
    cm.addConnection( connection );
    util.log( '[%s] Server accepted connection: %s:%d' , this.id , socket.remoteAddress , socket.remotePort );
};