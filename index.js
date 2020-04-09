'use strict'

const WebSocket = require('ws')
const standardSettings = require('standard-settings')
const settings = standardSettings.getSettings()

const host = settings.host || "127.0.0.1"
const port = settings.port || 9375

const wss = new WebSocket.Server({
  host,
  port,
  perMessageDeflate: false
})

wss.on('connection', function connection (ws) {
  ws.on('message', function incoming (message) {
    console.log('received: %s', message)
  })

  ws.send('from server')
})
