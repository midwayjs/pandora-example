module.exports = function(pandora) {

  /** 
    重要前提:
    Pandora.js 中已经默认包含 worker 和 background 的进程定义
    ，只要往里面注册 Service 就能激活。
      pandora.process('worker').scale(pandora.dev ? 1: 'auto');
      pandora.process('background').scale(1);
  */

  pandora
    .process('background')
    .argv(['--max-old-space-size=512']);

  pandora
    .service('pageSnapshot', './services/PageSnapshot')
    .process('background')
    .publish();

  pandora
    .service('web', './services/Web')
    .process('worker')
    .config({
      port: 5511
    });

};
