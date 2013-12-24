var crypto = require( 'crypto' );

// http://stackoverflow.com/questions/9407892/how-to-generate-random-sha1-hash-to-use-as-id-in-node-js
module.exports.uniqueId = function() {
    var current_date = (new Date()).valueOf().toString();
    var random = Math.random().toString();
    crypto.createHash('sha1').update(current_date + random).digest('hex');
};