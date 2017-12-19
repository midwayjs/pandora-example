const {promisify} = require('util');
const jayson = require('jayson/promise');
const uuid = require('uuid');

class TryRpc {

  constructor(ctx) {

    this.logger = ctx.logger;

    this.uuid = uuid.v4();
    this.port = ctx.config.port;
    this.host = ctx.config.host || '127.0.0.1';

    this.etcd = ctx.getDependency('etcd');
    this.etcdKey = '/JSONRPC/' + this.uuid;

    this.server = jayson.server(this.getRpcMethods());
    this.http = this.server.http();

  }

  getRpcMethods() {
    return {
      async add(args) {
        return args[0] + args[1];
      },
      async mul(args) {
        return args[0] * args[1];
      }
    };
  }

  async start() {

    await promisify(this.http.listen).call(this.http, this.port, this.host);


    await this.startHeartbeat();

    this.logger.info('Service JSON RPC Listens On http://' + this.host + ':' + this.port);

  }

  async startHeartbeat() {
    const interval = 30;
    const value = JSON.stringify({
      uuid: this.uuid,
      hostname: this.host,
      port: this.port
    });
    const once = () => {
      return promisify(this.etcd.set).call(this.etcd, this.etcdKey, value, {ttl: interval * 2})
        .catch(this.logger.error.bind(this.logger));
    };
    await once();
    this.timer = setInterval(once, interval * 1000);
  }

  async stop() {
    if(this.timer) {
      clearInterval(this.timer);
    }
    await promisify(this.etcd.del).call(this.etcd, this.etcdKey);
    await promisify(this.http.close).call(this.http);
    this.logger.info('Service JSON RPC Stopped');

  }

}

TryRpc.dependencies = ['etcd'];
module.exports = TryRpc;
