import * as io from 'socket.io-client'

const masterVideo = <HTMLVideoElement> document.querySelector('#master-video')
const startButton = <HTMLButtonElement> document.querySelector('#start-master-video')
const endButton = <HTMLButtonElement> document.querySelector('#end-master-video')

// 本机视频流是否处于开启状态.
let streamIsOn: boolean = false

// 为控制按钮加入点击事件.
startButton.addEventListener('click', startMasterStream)
endButton.addEventListener('click', endMasterStream)

/**
 * 启动本机 WebRTC 通信.
 * 将获取本机音视频流并连接至 Signaling 服务器.
 * 之后等待其他客户端接入.
 */
async function startMasterStream () {
  if (streamIsOn) {
    return
  }

  // 本机音视频流对象.
  let stream: MediaStream = null

  // 1. 获取音视频流, 若失败则不进行操作.
  try {
    stream = await getMasterMedia()
  } catch (error) {
    console.error('[Error] 获取本机音视频流失败:', error)
    return
  }

  // 2. 将视频画面绘至本地界面.
  const streamURL = window.URL.createObjectURL(stream)
  masterVideo.src = streamURL
  masterVideo.play()

  // 3. 连接至 Signaling 服务器.
  try {
    const signalingID = await conenctToSignalingServer()
    console.log('[Info] Signaling 服务器已连接, id:', signalingID)
  } catch (error) {
    console.error('[Error] Signaling 服务器连接失败:', error)
    return
  }
}

/**
 * 关闭本机视频流.
 */
function endMasterStream () {
}

/**
 * 获取本机音视频流.
 *
 * @returns {Promise<MediaStream>}
 */
function getMasterMedia (): Promise<MediaStream> {
  return new Promise((resolve, reject) => {
    navigator.getUserMedia({ video: true, audio: true }, function (stream) {
      resolve(stream)
    }, function (error) {
      reject(error)
    })
  })
}

/**
 * 连接至 Signaling 服务器.
 *
 * @returns {Promise<string>}
 */
function conenctToSignalingServer (): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket = io.connect('http://localhost:3000')

    socket.on('connected', (id: string) => {
      resolve(id)
    })

    socket.on('error', error => {
      reject(error)
    })
  })
}
