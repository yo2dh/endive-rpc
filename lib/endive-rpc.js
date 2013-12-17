var net = require( 'net' );

module.exports = erpc;
erpc.prototype = {};

function erpc( options ) {

    var self = this;
    self.options = options || {};

    self.socket = null;

};

erpc.prototype.connect = function( host , port ) {

    var c = net.connect ( host , port , this.onConnect );
    c.on( 'error' , function( e ) {
        console.log( 'error: ' + e.code );
    });
    return true;
};

erpc.prototype.listen = function( port ) {
    return true;
};

erpc.prototype.onConnect = function( socket ) {
    console.log( 'connected: ' + socket.id );
};