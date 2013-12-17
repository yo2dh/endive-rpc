module.exports = process.env.ENDIVE_RPC_COV ?
    require('./lib-cov/index.js') :
    require('./lib/index.js');