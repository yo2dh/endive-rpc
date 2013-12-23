var util = require( 'endive-util' );

var Connection = function( connection ) {
    this.connection = connection;

    connection.on( 'data' , this.onReceived );
};

module.exports = Connection;

Connection.prototype.send = function( data ) {
    var c = this.connection;
    c.write( data , 'utf-8' , this.onWritten );
};

Connection.prototype.onWritten = function( ) {
    util.log( '[%s] Connection data was written: %d' , arguments.length );
};

Connection.prototype.onReceived = function( data ) {
    util.log( '[%s] Connection data was received: %d' , arguments.length );

};