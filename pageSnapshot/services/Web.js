const querystring = require('querystring');
const url = require('url');
const SimpleHTTP = require('./SimpleHTTP');

module.exports = class Web extends SimpleHTTP {

  /**
   * @param ctx - 构造时会传递一个上下文对象，这个具体可以参考：
   *   http://www.midwayjs.org/pandora/api-reference/pandora/classes/servicecontextaccessor.html
   */
  constructor(ctx) {
    super(ctx);
    this.ctx = ctx;
  }

  /**
   * 实现父类要求的接口，处理 HTTP 请求
   */
  async onRequest(req, res) {

    // 标准的日志对象，父类中通过 this.logger = ctx.logger 获得
    // this.logger.info('Got a request url: ' + req.url);

    // 从 query 中获得 method 和 params
    const query = querystring.parse(url.parse(req.url).query);
    const targetUrl = query.url;
    if(!targetUrl) {
      throw new Error('Query [url] is required');
    }

    // 获得 pageSnapshot 对象代理
    // getProxy，在 serviceContext 中同样有暴露
    const pageSnapshot = await this.ctx.getProxy('pageSnapshot', {
      // 默认 5 秒超时，截取网页，还是需要加大点超时时间
      timeout: 10 * 1000
    });

    // 调用截图。
    // 现在 IPC Hub 不能直接传递 Buffer，需要 base64。
    const snapshot = await pageSnapshot.take(targetUrl);
    const jpg = new Buffer(snapshot.base64, 'base64');

    // 返回给客户端
    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    res.end(jpg);

  }

  /**
   * 实现父类要求的接口，提供 TCP 端口
   */
  getPort() {
    // 通过配置获取
    return this.ctx.config.port;
  }

};
