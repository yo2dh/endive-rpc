var net = require( 'net' );

var Server = require( './server/server' );
var ClientManager = require( './client/clientManager' );

module.exports = erpc;

function erpc() {
    var self = this;

    self.server = null;
    self.clientManager = new ClientManager( self.options.clientInfoList );
    self.server = new Server( self.options.serverInfo );
};

erpc.prototype.start = function() {
    this.clientManager.start();
    this.server.listen();
};

erpc.prototype.stop = function() {
    this.clientManager.stop();
    this.server.close();
};

erpc.prototype.getClient = function( id ) {
    return this.clientManager.getClient( id );
};