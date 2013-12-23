var Client = require( './client' );
var Hash = require( 'hashish' );

function ClientManager ( clientInfoList ) {
    var self = this;
    self.clients = [];

    var clients = self.clients;
    var length = clientInfoList.length;
    for( var i = 0 ; i < length ; i++ )
    {
        var clientInfo = clientInfoList[i];
        clients.push ( new Client( clientInfo.host , clientInfo.port , clientInfo.id ) );
    }

};

module.exports = ClientManager;

ClientManager.prototype.start = function() {
    var clients = this.clients;
    var length = clients.length;
    for( var i = 0 ; i < length ; i++ )
    {
        clients[i].start();
    }
};

ClientManager.prototype.stop = function() {
    var clients = this.clients;
    var length = clients.length;
    for( var i = 0 ; i < length ; i++ )
    {
        clients[i].stop();
    }
};