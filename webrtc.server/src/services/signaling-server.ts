import * as http from 'http'
import * as IO from 'socket.io'

/**
 * 创建 Signaling 服务器.
 *
 * @param {ICreateSignalingServer} option
 * @returns {SocketIO.Server}
 */
function createSignalingServer (option: ICreateSignalingServer): SocketIO.Server {
  if (!option.httpServer) {
    console.error('[Error] Please provide a http server instance while creating signaling server.')
    return null
  }

  const io = IO(option.httpServer)

  if (option.corsRule) {
    io.origins(option.corsRule)
  }

  return io
}

/**
 * Signaling 服务器业务初始化函数.
 *
 * @param {SocketIO.Server} io
 */
function initSignalingServer (io: SocketIO.Server) {
  io.on('connection', function (socket) {
    socket.emit('connected', socket.id)
  })
}

export {
  createSignalingServer,
  initSignalingServer
}

interface ICreateSignalingServer {
  httpServer: http.Server
  corsRule: string
}
