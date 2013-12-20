var net = require( 'net' );
var ClientManager = require( './client/clientManager' );

module.exports = erpc;

function erpc() {
    var self = this;

    self.socket = null;
    self.clientManager = new ClientManager( self.options.clientInfoList );
};

erpc.prototype.start = function() {

    this.clientManager.start();

};

erpc.prototype.stop = function() {
    this.clientManager.stop();

};

erpc.prototype.onConnect = function( socket ) {
    console.log( 'connected: ' + socket.id );
};