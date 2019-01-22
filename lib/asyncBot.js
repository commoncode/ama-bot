const proxyHandler = require('./proxyHandlers');

const genAsyncBot = (bot) => new Proxy(bot, proxyHandler);

module.exports = genAsyncBot;
