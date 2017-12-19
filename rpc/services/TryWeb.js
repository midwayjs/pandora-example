const {promisify} = require('util');
const jayson = require('jayson/promise');
const querystring = require('querystring');
const url = require('url');
const http = require('http');

/**
 * 实现一个 RPC 的消费端，在一个应用里虽然这样没啥实际意义
 */
class TryWeb {

  /**
   * @param ctx - 构造时会传递一个上下文对象，这个具体可以参考：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/classes/servicecontextaccessor.html
   */
  constructor(ctx) {

    // 从依赖中获取 etcd
    this.etcd = ctx.getDependency('etcd');

    // 从配置中获取 port
    this.port = ctx.config.port;

    // 标准 logger
    this.logger = ctx.logger;

  }

  /**
   * 标准的启动接口：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/interfaces/service.html#start
   */
  async start () {

    // 获得 HTTP Server
    this.server = this.getServer();

    // 异步等待 Server 监听成功才算启动完成
    await promisify(this.server.listen).call(this.server, this.port);
    this.server.listen(this.port);

    // 启动完成
    this.logger.info('Service HTTP Server Listens On http://127.0.0.1:' + this.port);

  }

  /**
   * 标准的停止接口：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/interfaces/service.html#stop
   */
  async stop () {

    // 异步等待取消监听成功才算停止完成
    await promisify(this.server.close).call(this.server);

    this.logger.info('Service HTTP Server Listens Service stopped');

  }

  /**
   * 创建示例的消费端 HTTP Server
   */
  getServer() {

    return http.createServer((req, res) => {

      this.logger.info('Got a request url: ' + req.url);

      (async () => {

        // 从 Query 中获得 method 和 params
        const parsedUrl = url.parse(req.url);
        const query = querystring.parse(parsedUrl.query);
        const method = query.method;
        const params = query.params ? JSON.parse(query.params) : [];

        // 获得 RPC 客户端
        const client = await this.getRpcClient();

        // 调用之
        this.logger.info(`Will rpc request, method: ${method}`, params);
        return client.request(method, params);

      })().then((result) => {

        // 完成请求
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));

      }).catch((err) => {

        // 完成请求
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(err));

      });

    });
  }

  /**
   * 通过 etcd 获得 RPC 客户端
   */
  async getRpcClient() {

    // etcd 中获得全部可用 nodes
    const etcdRes = await promisify(this.etcd.get).call(this.etcd, '/JSONRPC/', {recursive: true});
    const nodes = etcdRes.node.nodes;
    if(!nodes || !nodes.length) {
      throw new Error('Cannot found provider');
    }

    // 随机取一个（虽然我们例子中，怎么样都只有一个）
    const randomInt = getRandomInt(0, nodes.length - 1);
    const pickedNode = nodes[randomInt];
    const node = JSON.parse(pickedNode.value);
    this.logger.info('total got nodes: ' + nodes.length);
    this.logger.info('use node: ' + pickedNode.value);

    // 创建 client
    const client = jayson.client.http({
      hostname: node.hostname,
      port: node.port
    });

    return client;
  }
}

// 标记依赖，在 TC39 Stage2 中可以使用 static dependencies 代替
TryWeb.dependencies = ['etcd'];
module.exports = TryWeb;

/**
 * 随机函数
 * @param min
 * @param max
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
