import * as http from 'http'

/**
 * 创建 http 服务器.
 *
 * @param {any} { corsOrigin = false }
 * @returns {http.Server}
 */
function createHttpServer ({ corsOrigin = false }): http.Server {
  // 创建 Http 服务器来响应 WebSocket 握手.
  const httpServer = http.createServer((req, res) => {
    if (corsOrigin) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.host)
      res.setHeader('Access-Control-Request-Method', '*')
      res.setHeader('Access-Control-Allow-Methods', '*')
      res.setHeader('Access-Control-Allow-Headers', '*')
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }

    // 对于外部 Http 请求，返回一个简易的数据.
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })

    res.end(JSON.stringify({
      status: 200,
      message: 'OK'
    }))
  })

  return httpServer
}

export {
  createHttpServer
}
