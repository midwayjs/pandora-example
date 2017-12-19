const {promisify} = require('util');
const jayson = require('jayson/promise');
const querystring = require('querystring');
const url = require('url');

const http = require('http');

// Service 实现为一个类，在模块有两种导出形式：
// 1. ES5: module.exports = class HTTPServer {}
// 2. ES7: export default class HTTPServer {}
class TryWeb {

  // 构造时会传递一个上下文对象，这个具体可以参考：
  //   http://www.midwayjs.org/pandora/api-reference/pandora/classes/servicecontextaccessor.html
  constructor(ctx) {

    this.etcd = ctx.getDependency('etcd');
    this.port = ctx.config.port;
    this.logger = ctx.logger;

  }

  // 标准的启动接口：
  //   http://www.midwayjs.org/pandora/api-reference/pandora/interfaces/service.html#start
  async start () {

    this.server = this.getServer();

    // 异步等待 Server 监听成功才算启动完成
    await promisify(this.server.listen).call(this.server, this.port);
    this.server.listen(this.port);

    this.logger.info('Service HTTP Server Listens On http://127.0.0.1:' + this.port);

  }


  // 标准的停止接口：
  //   http://www.midwayjs.org/pandora/api-reference/pandora/interfaces/service.html#stop
  async stop () {

    // 异步等待取消监听成功才算停止完成
    await promisify(this.server.close).call(this.server);

    this.logger.info('Service HTTP Server Listens Service stopped');

  }

  getServer() {

    return http.createServer((req, res) => {

      // 标准的日志对象，会记录在 ${logsDir}/${appName}/service.log
      this.logger.info('Got a request url: ' + req.url);

      (async () => {

        const parsedUrl = url.parse(req.url);
        const query = querystring.parse(parsedUrl.query);
        const method = query.method;
        const params = query.params ? JSON.parse(query.params) : [];
        const client = await this.getRpcClient();

        this.logger.info(`Will rpc request, method: ${method}`, params);
        return client.request(method, params);

      })().then((result) => {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
      }).catch((err) => {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(err));
      });

    });
  }

  async getRpcClient() {

    const etcdRes = await promisify(this.etcd.get).call(this.etcd, '/JSONRPC/', {recursive: true});
    const nodes = etcdRes.node.nodes;
    if(!nodes || !nodes.length) {
      throw new Error('Cannot found provider');
    }
    const randomInt = getRandomInt(0, nodes.length - 1);
    const pickedNode = nodes[randomInt];
    const node = JSON.parse(pickedNode.value);

    this.logger.info('total got nodes: ' + nodes.length);
    this.logger.info('use node: ' + pickedNode.value);

    const client = jayson.client.http({
      hostname: node.hostname,
      port: node.port
    });

    return client;

  }

}

TryWeb.dependencies = ['etcd'];
module.exports = TryWeb;

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
