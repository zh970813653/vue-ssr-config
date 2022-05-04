const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar') //chokidar 是第三方的一个包，它可以通过watch来监听一个文件的变化
const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')
const hotMiddleware = require('webpack-hot-middleware')
const resolve = file => path.resolve(__dirname, file)

module.exports = (server, callback) => {
  let ready
  const onReady = new Promise(r => ready = r)
  // 监听构建 => 更新renderer
  let template
  let serverBundle
  let clientManifest

  const update = () => {
    if (template && serverBundle && clientManifest) {
      ready()
      callback(serverBundle, template, clientManifest)
    }
  }

  // 监听 template => 调用update
  const templatePath = resolve('../index.template.html')
  template = fs.readFileSync(templatePath, 'utf-8')
  update()
  chokidar.watch(templatePath).on('change', () => {
    template = fs.readFileSync(templatePath, 'utf-8')
    update()

  })

  // 监听 serverBundle => 调用update
  const serverConfig = require('./webpack.server.config')
  // 通过webpack函数传入一个配置项后得到webpack编译器
  const serverCompiler = webpack(serverConfig)
  // 这个webpack插件可以将内容存放到内存当中 方便开发模式的读取
  const serverDevMiddleware = devMiddleware(serverCompiler, {
    logLevel: 'silent' //关闭日志输出
  })
  // 每次编译结束时 触发这个钩子
  serverCompiler.hooks.done.tap('server', () => {
    // 由于devMiddleware将内容存到了内存中， 所以我们不能通过fs去读取磁盘中内容了，要用过serverDevMiddleware.fileSyste去读取内存中的内容
    serverBundle = JSON.parse(
      serverDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-server-bundle.json'), 'utf-8'))
    update()
  })


  // 监听 clientManifest => 调用update
  const clientConfig = require('./webpack.client.config')
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
  clientConfig.entry.app = [
    'webpack-hot-middleware/client?reload=true&noInfo=true', //  和服务端交互处理热更新一个客户端脚本
    clientConfig.entry.app 
  ]
  clientConfig.output.filename = '[name].js' // 热更新模式下确保一致的 hash

  // 通过webpack函数传入一个配置项后得到webpack编译器
  const clientCompiler = webpack(clientConfig)
  // 这个webpack插件可以将内容存放到内存当中 方便开发模式的读取
  const clientDevMiddleware = devMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    logLevel: 'silent' //关闭日志输出
  })
  // 每次编译结束时 触发这个钩子
  clientCompiler.hooks.done.tap('client', () => {
    // 由于devMiddleware将内容存到了内存中， 所以我们不能通过fs去读取磁盘中内容了，要用过serverDevMiddleware.fileSyste去读取内存中的内容
    clientManifest = JSON.parse(
      clientDevMiddleware.fileSystem.readFileSync(resolve('../dist/vue-ssr-client-manifest.json'), 'utf-8'))
    update()
  })
  // 挂载热更新的中间件
  server.use(hotMiddleware(clientCompiler, {
    log: false // 关闭它本身的日志输出
  }))

  // 重要！！！ 将clientDevMiddleware挂载到express服务中，提供对其内部内存的返回
  server.use(clientDevMiddleware)
  return onReady
}