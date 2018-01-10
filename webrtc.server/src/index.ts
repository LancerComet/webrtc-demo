import { createHttpServer } from './services/http-server'
import { createSignalingServer, initSignalingServer } from './services/signaling-server'
import { createSign } from 'crypto';

const HOST = '0.0.0.0'
const PORT = 3000
const isDev = process.env.NODE_ENV === 'development'

// 创建 http 服务器.
const httpServer = createHttpServer({
  corsOrigin: isDev && 'http://localhost:8080'
})

// 创建 WebSocket 服务器，用于充当 Signaling 服务器.
const io = createSignalingServer({
  httpServer,
  corsRule: isDev && '*:*'  // 在开发环境下允许跨域请求，方便调试.
})

// 初始化 Signaling 服务器业务.
initSignalingServer(io)

// 启动 http 服务器.
httpServer.listen(PORT, HOST, () => {
  console.log(`[Info] Server is on at port ${PORT}.`)
})
