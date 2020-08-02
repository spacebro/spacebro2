'use strict'

const WebSocket = require('ws')
const standardSettings = require('standard-settings')
const settings = standardSettings.getSettings()
const { v1: uuid } = require('uuid')
const ip = require('ip')

const port = settings.port || 9375
const selfBroadcast = settings.selfBroadcast || false

const wss = new WebSocket.Server({
  port,
  perMessageDeflate: false
})

wss.on('listening', function listening () {
  console.log(`spacebro listening on ws://${ip.address()}:${wss.options.port} ...`)
})

wss.on('close', function close () {
  for (const client of wss.clients) {
    client.close()
  }
})

wss.on('connection', function connection (ws, req) {
  // console.log(req.url)
  // console.log(req.headers.host)
  // console.log(req.connection)
  // const query = url.parse(req.url, true).query
  const query = new URL(req.url, `ws://${req.headers.host}/`).searchParams
  // console.log(query)
  ws.name = query.get('name') || uuid()

  console.log(`${ws.name} is opened.`)

  ws.on('message', function incoming (raw) {
    let data = {}

    try {
      data = JSON.parse(raw)
      console.log(`received event from ${ws.name} to ${data.to || 'default'}`)
    } catch (err) {
      console.error('malformed JSON')
      if (typeof raw === 'string') {
        console.log('try to use the raw event as EventName')
        data.eventName = raw
      }
      console.log(raw)
    }

    const nameLog = data.eventName || '(no eventName prop found)'
    const propsLog = data.hasOwnProperty('data') ? `has props {${Object.keys(data.data)}}` : ''
    console.log(`event "${nameLog}" ${propsLog}`)

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

async function onAppExit () {
  console.log('\nsending close event.')
  await wss.close()
}
