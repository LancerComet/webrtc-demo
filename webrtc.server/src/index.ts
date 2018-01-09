import * as http from 'http'
import * as IO from 'socket.io'

const HOST = '0.0.0.0'
const PORT = 3000

const httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')
	res.setHeader('Access-Control-Request-Method', '*')
	res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  res.writeHead(200, {
    'Content-Type': 'text/html'
  })

  res.end('<h1>It works!</h1>')
})

const io = IO(httpServer)
io.origins('*:*')

io.on('connection', function (socket) {
  console.log('A new user is on.')
  socket.emit('greeting', 'Hello!')
})

httpServer.listen(PORT, HOST, () => {
  console.log(`[Info] Server is on at port ${PORT}.`)
})
