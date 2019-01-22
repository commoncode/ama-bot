const util = require('util');

const proxyHandler = {
  get: function (obj, prop) {
    switch (typeof obj[prop]) {
      case 'function': return util.promisify(obj[prop]);
      case 'object': return new Proxy(obj[prop], proxyHandler);
      default: return obj[prop];
    }
  },
};

module.exports = proxyHandler;
