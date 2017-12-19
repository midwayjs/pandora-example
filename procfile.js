module.exports = function(pandora) {

  // Etcd 是所有进程都要有的基础 Service
  pandora
    .service('etcd', './services/Etcd')
    .process('weak-all')
    .config({
      host: 'http://localhost:2379'
    });

  // 定义一个进程专门发布 RPC
  pandora
    .process('rpc')
    .scale(1);

  pandora
    .service('tryRpc', './services/TryRpc')
    .process('rpc')
    .config({
      port: 5222
    });

  // 定义一个进程专门发布传统 Web
  pandora
    .process('web')
    .scale(1);

  pandora
    .service('tryWeb', './services/TryWeb')
    .process('web')
    .config({
      port: 5555
    });



};
