const NodeEtcd = require('node-etcd');
module.exports = class Etcd extends NodeEtcd {
  constructor(ctx) {
    super(ctx.config.host);
  }
};