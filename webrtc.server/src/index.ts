import * as http from 'http'
import * as IO from 'socket.io'

const HOST = '0.0.0.0'
const PORT = 3000
const isDev = process.env.NODE_ENV === 'development'

// 创建 Http 服务器来响应 WebSocket 握手.
const httpServer = http.createServer((req, res) => {
  // 在开发环境下允许跨域请求，方便调试.
  if (isDev) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')
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

// 创建 WebSocket 服务器，用于充当 Signaling 服务器.
const io = IO(httpServer)

// 在开发环境下允许跨域请求，方便调试.
if (isDev) {
  io.origins('*:*')
}

io.on('connection', function (socket) {
  console.log('A new user is on.')
  socket.emit('greeting', 'Hello!')
})

httpServer.listen(PORT, HOST, () => {
  console.log(`[Info] Server is on at port ${PORT}.`)
})
