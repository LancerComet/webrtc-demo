import * as io from 'socket.io-client'

const masterVideo = <HTMLVideoElement> document.querySelector('#master-video')
const guestVideo = <HTMLVideoElement> document.querySelector('#guest-video')
const startButton = <HTMLButtonElement> document.querySelector('#start-remote-calling-btn')
const endButton = <HTMLButtonElement> document.querySelector('#end-remote-calling-btn')

main()

async function main () {
  // 为控制按钮加入点击事件.
  startButton.addEventListener('click', startMasterCalling)
  endButton.addEventListener('click', endMasterCalling)

  // 页面卸载时执行结束函数.
  window.addEventListener('beforeunload', endMasterCalling)

  let streamIsOn: boolean = false  // 本机视频流是否处于开启状态.
  let remoteConnected: boolean = false  // 远程是否已连接.
  let socket: SocketIOClient.Socket = null  // Signaling 通信服务器长连接.
  let stream: MediaStream = null  // 本地媒体流数据.

  // Peer Connection 是代表连接至远端的 WebRTC 连接. 接口提供了创建，保持，监控，关闭连接的方法的实现.
  // 客户端将使用此 Peer Connection 来连接至远方.
  let peerConnection: RTCPeerConnection = await createPeerConnection()

  // 初始化 Signaling 服务器通信连接.
  await initConnection()

  /**
   * 初始化 Signaling 服务器通信连接.
   */
  async function initConnection () {
    try {
      // 连接至 Signaling 服务器.
      socket = await conenctToSignalingServer()
      console.log('[Info] Signaling 服务器已连接:', socket)
    } catch (error) {
      console.error('[Error] Signaling 服务器连接失败:', error)
      endMasterCalling()  // 发生错误后关闭当前链接与视频.
      return
    }

    // 设置远端事件.
    // remote:offer 事件是用于接收远端 offer 的事件.
    socket.on('remote:offer', async (offerSDP: RTCSessionDescription) => {
      console.log('[Info] remote:offer -', offerSDP)

      // 设置远端 SDP.
      await peerConnection.setRemoteDescription(offerSDP)

      // 创建 answer.
      const answer = await peerConnection.createAnswer()
      const answerSDP = new RTCSessionDescription(answer)
      await peerConnection.setLocalDescription(answerSDP)

      // 发送 answer 至 Signaling 服务器.
      socket.emit('answer', answer)
    })

    // rmote:answer 事件是用于接收远端 answer 的事件.
    socket.on('remote:answer', async (answerSDP: RTCSessionDescription) => {
      // 如果已经连接客户端, 则不进行连接.
      if (remoteConnected) {
        return
      }
      console.log('[Info] remote:answer -', answerSDP)
      await peerConnection.setRemoteDescription(answerSDP)
      remoteConnected = true
    })
  }

  /**
   * 启动本机 WebRTC 通信.
   * 将获取本机音视频流并连接至 Signaling 服务器.
   * 之后等待其他客户端接入.
   */
  async function startMasterCalling () {
    if (streamIsOn) { return }

    // 1. 获取本地摄像设备媒体数据.
    const userMedia = await getUserMedia()  // 本机音视频流对象.
    if (userMedia.error) {
      return console.error('[Error] 本地媒体设备获取失败:', userMedia.error)
    }

    // 设置 Stream 引用.
    stream = userMedia.stream

    // 2. 创建 Peer Connection.
    if (!peerConnection) {
      peerConnection = await createPeerConnection()
    }

    // 3. 将视频画面绘至本地界面.
    playLocalVideoViaSrc(stream)

    // 4. 初始化 Peer Connection.
    // 将 Stream 添加至 Peer Connection 中.
    peerConnection.addStream(stream)

    // 创建 Peer Connection 的 offer.
    const offer = await peerConnection.createOffer()

    // 使用 offer 创建 description.
    const description = new RTCSessionDescription(offer)
    await peerConnection.setLocalDescription(description)

    // 5. 发送 offer 至 Signaling 服务器.
    socket.emit('offer', offer)

    streamIsOn = true
  }

  /**
   * 将流添加至本地视频画面.
   *
   * @param {string | MediaStream} src
   */
  function playLocalVideoViaSrc (src: string | MediaStream) {
    if (typeof src === 'string') {
      masterVideo.src = src
    } else {
      masterVideo.srcObject = src
    }
    masterVideo.play()
  }

  /**
   * 关闭本机视频呼叫
   */
  async function endMasterCalling () {
    if (streamIsOn) {
      masterVideo.pause()
      guestVideo.pause()
      streamIsOn = false
    }

    if (remoteConnected) {
      peerConnection.close()
      remoteConnected = false

      // 创建一个新的 PeerConnection 来丢弃之前的对象.
      peerConnection = await createPeerConnection()
    }
  }
}

/**
 * 创建 Peer Connection.
 * Peer Connection 是代表连接至远端的 WebRTC 连接. 接口提供了创建，保持，监控，关闭连接的方法的实现.
 * 客户端将使用此 Peer Connection 来连接至远方.
 *
 * @returns {Promise<RTCPeerConnection>}
 */
async function createPeerConnection (): Promise<RTCPeerConnection> {
  const peerConnection = new RTCPeerConnection(null)

  // 设置 onaddstream 事件.
  // 当有新的连接进入时将触发此事件, 创建新的视频节点.
  peerConnection.onaddstream = function (event) {
    guestVideo.srcObject = event.stream
    guestVideo.play()
  }

  return peerConnection
}

/**
 * 获取本地摄像设备媒体数据.
 *
 * @returns {Promise<{ stream: MediaStream, error: Error }>}
 */
async function getUserMedia (): Promise<{ stream: MediaStream, error: Error }> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    return {
      error: null,
      stream
    }
  } catch (error) {
    return {
      error,
      stream: null
    }
  }
}

/**
 * 连接至 Signaling 服务器.
 *
 * @returns {Promise<SocketIOClient.Socket>}
 */
function conenctToSignalingServer (): Promise<SocketIOClient.Socket> {
  return new Promise((resolve, reject) => {
    const host = location.hostname
    const port = 3000
    const socket = io.connect(`http://${host}:${port}`)

    socket.on('connected', () => {
      resolve(socket)
    })

    socket.on('error', error => {
      reject(error)
    })
  })
}
