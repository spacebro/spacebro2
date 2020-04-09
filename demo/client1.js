'use strict'

const WebSocket = require('ws')

const host = '127.0.0.1'
const port = 9375

const ws = new WebSocket(`ws://${host}:${port}`)

ws.on('open', function open () {
  ws.send('client 1')
})

ws.on('message', function incoming (data) {
  console.log(data)
})
