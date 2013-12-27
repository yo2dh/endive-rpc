var Buffer = require( './../buffer/autoBuffer' );

var Protocol = function()
{
    this.buffer = new Buffer();
};

module.exports = Protocol;

Protocol.prototype.Init = function()
{
    this.buffer.reset();

};

Protocol.prototype.processPacket = function( packet ) {
    this.buffer.append( packet );


};