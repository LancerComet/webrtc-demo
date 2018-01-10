// getUserMedia 加入兼容.
navigator.getUserMedia = navigator.getUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.msGetUserMedia

/**
 * 扩展 Navigator 接口，加入浏览器私有函数.
 *
 * @interface Navigator
 */
interface Navigator {
  mozGetUserMedia: (constraints: MediaStreamConstraints, successCallback: NavigatorUserMediaSuccessCallback, errorCallback: NavigatorUserMediaErrorCallback) => void
  webkitGetUserMedia: (constraints: MediaStreamConstraints, successCallback: NavigatorUserMediaSuccessCallback, errorCallback: NavigatorUserMediaErrorCallback) => void
  msGetUserMedia: (constraints: MediaStreamConstraints, successCallback: NavigatorUserMediaSuccessCallback, errorCallback: NavigatorUserMediaErrorCallback) => void
}
