import * as io from 'socket.io-client'

const socket = io.connect('http://localhost:3000')
socket.on('greeting', function (data) {
  console.log(data);
})
