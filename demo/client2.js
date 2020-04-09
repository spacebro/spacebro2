'use strict'

const WebSocket = require('ws')

const host = '127.0.0.1'
const port = 9375
const name = 'client-2'

const ws = new WebSocket(`ws://${host}:${port}/?name=${name}`)

ws.on('open', function open () {
  ws.send('client 2')
})

ws.on('message', function incoming (data) {
  console.log(data)
})
