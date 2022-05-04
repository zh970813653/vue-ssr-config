const Vue = require('vue')
const express = require('express')
const fs = require('fs')
const { createBundleRenderer } = require('vue-server-renderer')
const setupDevServer = require('./build/setup-dev-server')


const server = express()
// 利用中间件让服务端直接请求资源 ，这段代码意思就是当请求以dist开头的资源时，利用express.static中间区dist目录中查找
server.use('/dist', express.static('./dist'))

const isProd = process.env.NODE_ENV === 'production'
let renderer
let onReady
if (isProd) {
  const serverBundle = require('./dist/vue-ssr-server-bundle.json')
  const template = fs.readFileSync('./index.template.html', 'utf-8')
  const clientManifest = require('./dist/vue-ssr-client-manifest.json')
  renderer = createBundleRenderer(serverBundle, {
    template,
    clientManifest
  })
} else {
  // 开发模式 => 监听打包构建 => 重新生成 Renderder渲染器
  onReady = setupDevServer(server, (serverBundle, template, clientManifest) => {
    renderer = createBundleRenderer(serverBundle, {
      template,
      clientManifest
    })
  })
}
const render = async (req,res) => {
  try{
    const html = await renderer.renderToString({
      url: req.url
    })
    res.end(html)
  }catch(e){
    res.status(500).end(e.message)
  }
  
  
  // renderer.renderToString({
  //   title: 'zhanghang',
  //   url: req.url
  // },(err,html) => {
  //   if ((err)) {
  //     return res.status(500).end('Internal Server Error.')
  //   }
  //   res.end(html)
  // })
}
// const render = async (req, res) => {
//   console.log(req,res);
//   const context = { url: req.url }
//   try{
//     const html = await renderer.renderToString(context)
//     res.send(html)
//   }catch(err){
//     res.status(500).end(err.message)
//   }
// }

// 当设置为*时意味着所有路由都会走进这里
server.get('*', isProd ? render : async (req, res) => {
  // 等待有了renderder渲染器后调用render进行渲染
  await onReady
  render(req, res)
})

server.listen(3000, () => {
  console.log('port at 3000');
})

