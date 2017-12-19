const {promisify} = require('util');
const jayson = require('jayson/promise');
const uuid = require('uuid');

/**
 * 实现一个服务自发现的 Provider
 */
class TryRpc {

  /**
   * @param ctx 构造时会传递一个上下文对象，这个具体可以参考：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/classes/servicecontextaccessor.html
   */
  constructor(ctx) {

    // 生成个 UUID 作这个 Provider 的标识好了
    this.uuid = uuid.v4();

    // 标准的 Logger 对象
    //   http://www.midwayjs.org/pandora/api-reference/pandora/classes/servicecontextaccessor.html#logger
    this.logger = ctx.logger;

    // 从 config 里拿 RPC 监听的地址
    this.port = ctx.config.port;
    this.host = ctx.config.host || '127.0.0.1';

    // 从依赖里获得 etcd
    //   http://www.midwayjs.org/pandora/api-reference/pandora/classes/servicecontextaccessor.html#getdependency
    this.etcd = ctx.getDependency('etcd');

    // 得到自己在 etcd 上的 key
    this.etcdKey = '/JSONRPC/' + this.uuid;

    // 得到自己在 etcd 上的 Value
    this.etcdValue = JSON.stringify({
      uuid: this.uuid,
      hostname: this.host,
      port: this.port
    });

    // 通过 jayson 创建一个 RPC 服务
    this.server = jayson.server(this.getRpcMethods());

    // 我们通过 jayson 的 http 界面暴露服务
    this.http = this.server.http();

  }

  /**
   * 获得 RPC 中暴露的方法
   */
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

  /**
   * 标准的启动接口
   */
  async start() {

    // 将我们的 RPC 的 HTTP 界面进行监听
    await promisify(this.http.listen).call(this.http, this.port, this.host);

    // 在 etcd 中暴露，并且定时心跳
    await this.startHeartbeat();

    // 启动完成
    this.logger.info('Service JSON RPC Listens On http://' + this.host + ':' + this.port);

  }

  /**
   * 标准的停止接口
   */
  async stop() {

    // 清除心跳定时器
    if(this.timer) {
      clearInterval(this.timer);
    }

    // 把自己从 etcd 上删除，等于下线
    await promisify(this.etcd.del).call(this.etcd, this.etcdKey);

    // TODO: 等待所有的 RPC 调用都结束，否则会出现客户端调用超时

    // 已经从 etcd 上下线，并且所有存量 RPC 调用也已经完成
    // 关闭 HTTP 监听
    await promisify(this.http.close).call(this.http);

    // 下线完成
    this.logger.info('Service JSON RPC Stopped');
  }

  /**
   * 开始向 etcd 注册，并开始心跳
   */
  async startHeartbeat() {
    const interval = 30;
    const value = this.etcdValue;
    const once = () => {
      return promisify(this.etcd.set).call(this.etcd, this.etcdKey, value, {ttl: interval * 2})
        .catch(this.logger.error.bind(this.logger));
    };
    await once();
    this.timer = setInterval(once, interval * 1000);
  }


}

// 标记依赖，在 TC39 Stage2 中可以使用 static dependencies 代替
TryRpc.dependencies = ['etcd'];
module.exports = TryRpc;
