const NodeEtcd = require('node-etcd');

/**
 * 简单继承 NodeEtcd 即可
 */
module.exports = class Etcd extends NodeEtcd {
  constructor(ctx) {
    // 从 ctx 中获得配置，传给父类构造
    super(ctx.config.host);
  }
};