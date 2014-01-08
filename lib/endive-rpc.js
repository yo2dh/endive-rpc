var EventEmitter = require( 'events' ).EventEmitter;

var hash = require( 'hashish' );
var util = require( 'util' );
var utils = require( './util/util')
var net = require( 'net' );
var LocalInterface = require( './interface/localInterface' );
var Server = require( './server/server' );
var ClientManager = require( './client/clientManager' );

function erpc() {

    EventEmitter.call( this );

    var self = this;

    self.isStart        = false;
    self.handler        = {};

    self.server         = self.options.serverInfo != null ? new Server( self.options.serverInfo ) : null;
    self.clientManager  = self.options.clientInfoList != null ? new ClientManager( self.options.clientInfoList , this ) : null;

};

util.inherits( erpc , EventEmitter );

module.exports = erpc;

erpc.prototype.setHandler = function( handler ) {
    var self = this;
    // getConnectionId ( host , port , socket )
    hash( handler ).forEach( function( fname , key ) {
        self.handler[key] = fname;
    });
};

erpc.prototype.start = function() {
    if ( this.isStart ) return;

    if ( this.clientManager != null )
    {
        this.clientManager.start();
    }
    if ( this.server != null )
    {
        this.server.listen();
    }
    this.isStart = true;
};

erpc.prototype.stop = function() {
    if ( this.isStart == false ) return;

    if ( this.clientManager != null )
    {
        this.clientManager.stop();
    }
    if ( this.server != null )
    {
        this.server.close();
    }
    this.isStart = false;
};

erpc.prototype.getClient = function( id ) {
    if ( this.clientManager == null ) return;

    return this.clientManager.getClient( id );
};

erpc.prototype.connect = function( host , port , id , ownerListener , functions ) {
    var clientInfo = {
        host: host ,
        port: port ,
        id: id || null ,
        ownerListener: ownerListener || null ,
        localFunctions: functions || this.functions
    };
    if ( this.clientManager == null )
    {
        this.clientManager = new ClientManager( [ clientInfo ] , this );
        if ( this.isStart )
        {
            this.clientManager.start();
        }
    }
    else
    {
        this.clientManager.addClientInfo( clientInfo );
    }
    if ( this.isStart == false )
    {
        this.start();
    }
    return this;
};

erpc.prototype.listen = function( port , id , functions ) {
    var serverInfo = {
        port: port ,
        id: id ,
        functions: functions || this.functions
    };

    if( this.server == null )
    {
        this.server = new Server( serverInfo );
        if ( this.isStart )
        {
            this.server.start();
        }
    }
    else
    {
        throw new Error( 'Error: already started to listen.' );
    }
    if ( this.isStart == false )
    {
        this.start();
    }

    return this;
};