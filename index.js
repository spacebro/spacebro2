'use strict'

const WebSocket = require('ws')
const standardSettings = require('standard-settings')
const settings = standardSettings.getSettings()

const host = settings.host || "127.0.0.1"
const port = settings.port || 9375
const selfBroadcast = settings.selfBroadcast || false

const wss = new WebSocket.Server({
  host,
  port,
  perMessageDeflate: false
})

wss.on('listening', function listening () {
  console.log(`spacebro listening on ws://${wss.options.host}:${wss.options.port}...`)
})

wss.on('connection', function connection (ws) {
  ws.on('message', function incoming (data) {
    console.log('received: %s', data)

    wss.clients.forEach((client) => {
      if ((client !== ws || selfBroadcast) && client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  })

  ws.send('from server')
})
