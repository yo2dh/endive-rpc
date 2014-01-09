var INCREMENT_SIZE = 2048;

var AutoBuffer = function( bufferSize ) {

    bufferSize          = bufferSize || INCREMENT_SIZE;
    this.buffer         = new Buffer ( bufferSize );
    this.usedLength     = 0;
};

module.exports = AutoBuffer;

AutoBuffer.prototype.getRemainSize = function() {
    return (this.buffer.length - this.usedLength);
};

AutoBuffer.prototype.getLength = function() {
    return this.usedLength;
};

AutoBuffer.prototype.getBuffer = function() {
    return this.buffer;
};

AutoBuffer.prototype.append = function( buffer ) {
    if ( Buffer.isBuffer ( buffer ) === false )
    {
        throw new Error( 'buffer is not instance of Buffer.' );
    }
    this.resize( buffer.length );

    buffer.copy( this.buffer , this.usedLength );
    this.usedLength += buffer.length;
};

AutoBuffer.prototype.peak = function( buffer , readSize , sourceStart ) {
    if ( Buffer.isBuffer ( buffer ) === false )
    {
        throw new Error( 'buffer is not instance of Buffer.' );
    }
    sourceStart = sourceStart || 0;
    readSize = readSize || buffer.length;

    var sourceEnd = readSize + sourceStart;

    if ( this.usedLength < sourceEnd )
    {
        sourceEnd = this.usedLength;
    }
    this.buffer.copy( buffer , 0 , sourceStart , sourceEnd );
    return sourceEnd - sourceStart;
};

AutoBuffer.prototype.peakUInt16 = function( offset ) {
    var buffer = this.buffer;
    if ( this.getLength() < 2 )
    {
        return null;
    }
    return parseInt ( this.buffer.readUInt16BE( offset ) , 10 );
};

AutoBuffer.prototype.peakUInt8 = function( offset ) {
    var buffer = this.buffer;
    if ( this.getLength() < 1 + offset )
    {
        return null;
    }
    return parseInt ( buffer.readUInt8( offset ) , 10 );
};

AutoBuffer.prototype.pop = function( buffer , readSize , sourceStart ) {

    readSize = readSize || buffer.length;
    sourceStart = sourceStart || 0;
    var realReadLength = this.peak( buffer , readSize , sourceStart );
    var popSize = realReadLength + sourceStart;

    this.remove( popSize );
    return realReadLength;
};

AutoBuffer.prototype.resize = function( expectedRemainLength ) {
    if ( this.getRemainSize() < expectedRemainLength )
    {
        var buffer = this.buffer;
        var length = buffer.length;
        var incrementSize = INCREMENT_SIZE;
        if ( incrementSize < expectedRemainLength )
        {
            incrementSize = expectedRemainLength;
        }
        var newBuffer = new Buffer( length + incrementSize );
        buffer.copy( newBuffer );
        this.buffer = newBuffer;
    }
};

AutoBuffer.prototype.remove = function( size ) {
    if ( size <= 0 ) return;

    if( size == this.usedLength )
    {
        this.usedLength = 0;
    }
    else
    {
        this.buffer.copy( this.buffer , 0 , size );
        this.usedLength -= size;
    }
};

AutoBuffer.prototype.reset = function( bufferSize ) {
    if ( bufferSize != null )
    {
        if ( this.buffer.length != bufferSize )
        {
            this.buffer = new Buffer ( bufferSize );
        }
    }
    this.usedLength = 0;
};