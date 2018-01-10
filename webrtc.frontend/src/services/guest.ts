const appElement = document.querySelector('#webrtc-app')

/**
 * 创建游客视频播放节点.
 *
 * @param {(string | MediaStream)} src
 * @param {string} [id=createRandomString()]
 */
function createGuestVideo (src: string | MediaStream, id: string = createRandomString()) {
  const ctnrElement = document.createElement('div')
  ctnrElement.id = `guest-video-ctnr-${id}`
  ctnrElement.className = 'guest-panel'

  const title = document.createElement('h2')
  title.textContent = 'Guest'

  const video = <HTMLVideoElement> document.createElement('video')
  video.id = `guest-video-${id}`
  video.className = 'stream-video'
  video.width = 480
  video.height = 272

  if (typeof src === 'string') {
    video.src = src
  } else {
    video.srcObject = src
  }

  ctnrElement.appendChild(title)
  ctnrElement.appendChild(video)
  appElement.appendChild(ctnrElement)

  video.play()
}

function unloadGuestVideo (id: string) {
  const ctnrElement = document.querySelector(`guest-video-ctnr-${id}`)
  if (ctnrElement) {
    ctnrElement.parentElement.removeChild(ctnrElement)
  }
}

export {
  createGuestVideo
}

function createRandomString (): string {
  return Math.floor(Math.random() * Date.now()).toString(16)
}
