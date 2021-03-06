var Client = require( './client' );
var Hash = require( 'hashish' );
var util = require( './../util/util' );

function ClientManager ( clientInfoList , ownerListener ) {

    clientInfoList = clientInfoList || [];

    var self = this;
    self.clients = [];
    self.isStart = false;
    self.ownerListenr = ownerListener;

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

    var clients = this.clients;
    var client = new Client( this.ownerListenr ,
                             clientInfo.host ,
                             clientInfo.port ,
                             clientInfo.id || utils.generateUniqueId( clients ) ,
                             clientInfo.localFunctions );

    clients[clientInfo.id] = client;
    if ( this.isStart )
    {
        client.start();
    }
};

ClientManager.prototype.getClient = function( id ) {
    return this.clients[id];
};