var net = require( 'net' );

var Server = require( './server/server' );
var ClientManager = require( './client/clientManager' );

module.exports = erpc;

function erpc() {
    var self = this;

    self.server         = self.options.serverInfo != null ? new Server( self.options.serverInfo ) : null;
    self.clientManager  = self.options.clientInfoList != null ? new ClientManager( self.options.clientInfoList ) : null;
};

erpc.prototype.start = function() {
    if ( this.clientManager != null )
    {
        this.clientManager.start();
    }
    if ( this.server != null )
    {
        this.server.listen();
    }
};

erpc.prototype.stop = function() {
    if ( this.clientManager != null )
    {
        this.clientManager.stop();
    }
    if ( this.server != null )
    {
        this.server.close();
    }
};

erpc.prototype.getClient = function( id ) {
    if ( this.clientManager == null ) return;

    return this.clientManager.getClient( id );
};