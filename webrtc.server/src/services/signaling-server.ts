import * as http from 'http'
import * as Socket from 'socket.io'

/**
 * Signaling 用户列表.
 */
const userList: {[userID: string]: {
  offer: RTCSessionDescription,
  answer: RTCSessionDescription
}} = {}

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

  const io = Socket(option.httpServer)

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
  io.on('connection', socket => {
    const id = socket.id
    console.log('[Info] 新用户加入:', id)

    userList[id] = {
      offer: null, answer: null
    }

    // 设置 onOffer 事件.
    // 客户端发送 offer 事件寻求连接用户.
    socket.on('offer', (offer: RTCSessionDescription) => {
      console.log(`[Info] "${id}" on offer.`)

      // 将用户与其 offer 加入用户列表.
      userList[id].offer = offer

      // 广播 offer 至其他客户端.
      socket.broadcast.emit('remote:offer', offer)
    })

    // 设置 onAnswer 事件.
    // 客户端发送 answer 事件告知对方客户端已连接.
    socket.on('answer', (answer: RTCSessionDescription) => {
      console.log(`[Info] "${id}" on answer.`)
      userList[id].answer = answer
      socket.broadcast.emit('remote:answer', answer)
    })

    // 向用户发送欢迎信息.
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
