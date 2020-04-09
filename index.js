'use strict'

const WebSocket = require('ws')

const port = 9375

const wss = new WebSocket.Server({ port })

wss.on('connection', function connection (ws) {
  ws.on('message', function incoming (message) {
    console.log('received: %s', message)
  })

  ws.send('from server')
})
