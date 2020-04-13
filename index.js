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

wss.on('close', function close () {
  for(const client of wss.clients) {
    client.close()
  }
})

wss.on('connection', function connection (ws, req) {
  const query = url.parse(req.url, true).query
  ws.name = query.name || uuid()

  console.log(`${ws.name} is opened.`)

  ws.on('message', function incoming (raw) {
    const data = JSON.parse(raw)
    console.log(`received ${data} from ${ws.name} to ${data.to || 'default'}`)

    if (data.to && data.to !== 'default') {
      for (const client of wss.clients) {
        if (client.name === data.to) {
          send(client, data, ws.name)
        }
      }
    } else {
      wss.clients.forEach((client) => {
        if ((client !== ws || selfBroadcast)) {
          send(client, data, ws.name)
        }
      })
    }

  })

  ws.on('close', function closing (code) {
    console.log(`${ws.name} is closed.`)
  })

  send(ws, { eventName: 'connected', data: `connected with id ${ws.name}` }, 'server')
})

function send (client, data, name) {
  if (client.readyState === WebSocket.OPEN) {
    try {
      const payload = JSON.stringify({ ...data, from: name })
      client.send(payload)
    } catch (e) {
      console.log(e)
    }
  }
}

process.on('SIGINT', onAppExit)
process.on('SIGQUIT', onAppExit)
process.on('SIGTERM', onAppExit)

function onAppExit () {
  wss.close()
}
