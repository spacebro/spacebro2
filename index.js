'use strict'

const url = require('url')
const WebSocket = require('ws')
const standardSettings = require('standard-settings')
const settings = standardSettings.getSettings()
const { v1: uuid } = require('uuid')

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

wss.on('connection', function connection (ws, req) {
  const query = url.parse(req.url, true).query
  const name = query.name || uuid()

  console.log(`${name} is opened.`)

  ws.on('message', function incoming (raw) {
    const data = JSON.parse(raw)
    console.log(`received ${data} from ${name}`)

    wss.clients.forEach((client) => {
      if ((client !== ws || selfBroadcast) && client.readyState === WebSocket.OPEN) {
        try {
          const payload = JSON.stringify({ ...data, from: name })
          client.send(payload)
        } catch (e) {
          console.log(e)
        }
      }
    })
  })

  ws.on('close', function closing (code) {
    console.log(`${name} is closed.`)
  })

  ws.send(`connected with id ${name}`)
})
