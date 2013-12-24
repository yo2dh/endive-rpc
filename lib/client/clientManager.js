var Client = require( './client' );
var Hash = require( 'hashish' );


function ClientManager ( clientInfoList ) {
    var self = this;
    self.clients = [];
    self.isStart = false;

    var clients = self.clients;
    var length = clientInfoList.length;
    for( var i = 0 ; i < length ; i++ )
    {
        this.addClientInfo( clientInfoList[i] );
    }
};

module.exports = ClientManager;

ClientManager.prototype.start = function() {
    if ( this.isStart === true ) return;


    var clients = this.clients;
    Hash( clients ).forEach( function( client , key ) {
        client.start();
    });

    this.isStart = true;
};

ClientManager.prototype.stop = function() {
    if ( this.isStart === false ) return;

    var clients = this.clients;
    Hash( clients ).forEach( function( client , key ) {
        client.stop();
    });

    this.isStart = false;
};

ClientManager.prototype.addClientInfo = function( clientInfo ) {
    var client = new Client( clientInfo.host , clientInfo.port , clientInfo.id );
    this.clients[clientInfo.id] = client;
    if ( this.isStart )
    {
        client.start();
    }
};

ClientManager.prototype.getClient = function( id ) {
    return this.clients[id];
};