'use strict'

const WebSocket = require('ws')

const host = '127.0.0.1'
const port = 9375
const name = 'client-1'
const autoReconnect = true

let ws = null
let reconnectTimeout = null

function setup () {
  ws = new WebSocket(`ws://${host}:${port}/?name=${name}`)

  ws.on('open', function open () {
    clearTimeout(reconnectTimeout)
    ws.send('client 1')
  })

  ws.on('message', function incoming (data) {
    console.log(data)
  })

  ws.on('error', function error (error) {
    // console.log(error)
  })

  ws.on('close', function closing (code) {
    console.log('socket closed')
    if (autoReconnect) {
      reconnectTimeout = setTimeout(() => {
        console.log('reconnecting...')
        setup()
      }, 500)
    }
  })
}

setup()
