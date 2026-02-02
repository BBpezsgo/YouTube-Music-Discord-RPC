// Source: https://github.com/XFG16/YouTubeDiscordPresence     License: LICENSE.1
//         https://github.com/lolamtisch/Discord-RPC-Extension License: LICENSE.2

const ws = {
  /** @type {WebSocket} */
  _: null,
  get ok() { return this._ && this._.readyState === WebSocket.OPEN },
  connect() {
    return new Promise((resolve, reject) => {
      if (this._ && this._.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      if (!this._ ||
        this._.readyState === WebSocket.CLOSING ||
        this._.readyState === WebSocket.CLOSED
      ) {
        try {
          console.log('Connecting ...')
          this._ = new WebSocket('ws://localhost:6969/')
          setPresenceIcon()

          this._.addEventListener('message', e => {
            const data = JSON.parse(e.data)

            if (data.version) {
              console.log('Server', data.version)
            } else if (data.action) {
              switch (data.action) {
                case 'join':
                  console.log('join', data)
                  //browser.runtime.sendMessage(data.extId, { action: 'join', clientId: data.clientId, secret: data.secret }).then(response => {
                  //  console.log('join redirected', response)
                  //})
                  break
                case 'joinRequest':
                  console.log('joinRequest', data)
                  //browser.runtime.sendMessage(data.extId, { action: 'joinRequest', clientId: data.clientId, user: data.user, tab: currentState.tabInfo.tabId }).then(replyResponse => {
                  //  console.log('joinRequest response', replyResponse)
                  //  websocket.send(JSON.stringify({
                  //    action: 'reply',
                  //    user: data.user,
                  //    clientId: data.clientId,
                  //    response: replyResponse
                  //  }))
                  //})
                  break
                default:
                  console.error('Unknown action', data)
                  break
              }
            } else {
              console.error('Unknown message', data)
            }
          })

        } catch (error) {
          reject(error)
          return
        }
      }

      this._.addEventListener('open', () => {
        console.log('Connected')
        setPresenceIcon()
        resolve()
      })

      this._.addEventListener('error', () => {
        setPresenceIcon()
        reject(new Error(`Could not connect`))
      })
    })
  },
  /**
   * @param {string | ArrayBufferLike | Blob | ArrayBufferView<ArrayBufferLike>} data
   */
  send(data) {
    if (this._ && this._.readyState === WebSocket.OPEN) {
      this._.send(data)
    }
    setPresenceIcon()
  },
}
//ws.connect()

function setPresenceIcon() {
  if (!ws.ok) {
    browser.action.setIcon({
      path: "icons/icon16-off.png"
    })
  } else if (presence) {
    browser.action.setIcon({
      path: "icons/icon16-on.png"
    })
  } else {
    browser.action.setIcon({
      path: "icons/icon16.png"
    })
  }
}

function sanitizePresence(presence) {
  if (!presence) return null

  //if emtpy
  if (typeof presence.details !== 'undefined' && presence.details === "") {
    delete presence.details
  }
  if (typeof presence.state !== 'undefined' && presence.state === "") {
    delete presence.state
  }
  if (typeof presence.largeImageKey !== 'undefined' && presence.largeImageKey === "") {
    delete presence.largeImageKey
  }
  if (typeof presence.smallImageKey !== 'undefined' && presence.smallImageKey === "") {
    delete presence.smallImageKey
  }
  if (typeof presence.largeImageText !== 'undefined' && presence.largeImageText === "") {
    delete presence.largeImageText
  }
  if (typeof presence.smallImageText !== 'undefined' && presence.smallImageText === "") {
    delete presence.smallImageText
  }
  if (typeof presence.type !== 'undefined' && ![0, 2, 3, 5].includes(presence.type)) {
    delete presence.type
  }

  if (typeof presence.endTimestamp !== 'undefined') {
    presence.endTimestamp = Math.round(presence.endTimestamp)
  }

  if (typeof presence.startTimestamp !== 'undefined') {
    presence.startTimestamp = Math.round(presence.startTimestamp)
  }

  //party
  if (!/^\d+$/.test(presence.partySize) || !/^\d+$/.test(presence.partyMax) || presence.partySize > presence.partyMax) {
    delete presence.partySize
    delete presence.partyMax
  }
  //state
  if (typeof presence.state !== 'undefined') {
    presence.state = presence.state.substring(0, 127)
  }
  //details
  if (typeof presence.details !== 'undefined') {
    presence.details = presence.details.substring(0, 127)
  }
  //endtimestamp
  if (typeof presence.endTimestamp !== 'undefined' && (!/^\d+$/.test(presence.endTimestamp) || presence.endTimestamp === "")) {
    delete presence.endTimestamp
  }
  //starttimestamp
  if (typeof presence.startTimestamp !== 'undefined' && (!/^\d+$/.test(presence.startTimestamp) || presence.startTimestamp === "")) {
    delete presence.startTimestamp
  }
  //buttons
  if (typeof presence.buttons !== 'undefined' && presence.buttons.length > 2) {
    while (presence.buttons.length > 2) {
      presence.buttons.pop()
    }
  }
  if (typeof presence.buttons !== 'undefined' && !presence.buttons.length) delete presence.buttons
  return presence
}

let presence = null

function makePresence(data) {
  const result = {
    type: 2,
    details: data.title.substring(0, 128),
    detailsUrl: data.videoId ? `https://music.youtube.com/watch?v=${data.videoId}` : null,
    stateUrl: data.channelUrl,
    state: data.author.substring(0, 128),
    statusDisplay: 2,
  }

  result.assets = {
    largeImageKey: data.thumbnailUrl,
  }

  if (data.playerState == 2) {
    return null
  } else if (data.timeLeft != -1) {
    result.timestamps = {
      start: Math.floor((Date.now() - ((data.duration - data.timeLeft) * 1000)) / 1000),
      end: Math.floor((Date.now() + (data.timeLeft * 1000)) / 1000),
    }
  } else {
    result.timestamps = {
      start: Math.floor(Date.now() / 1000)
    }
  }

  return result
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message.messageType) {
    console.warn('Invalid message', message, sender)
    return
  }

  switch (message.messageType) {
    case 'UPDATE_PRESENCE_DATA':
      console.log(message.detail)
      presence = makePresence(message.detail)
      setPresenceIcon()

      ws.connect()
        .then(() => {
          presence = sanitizePresence(presence)
          ws.send(JSON.stringify({
            presence: presence,
            clientId: '1467513379848589464',
          }))
        })
        .catch(console.error)
      break
    case 'REQUEST_UI':
      sendResponse({
        websocket: ws._?.readyState ?? null,
        presences: presence ? [presence] : [],
        domain: '',
      })
      break
    default:
      console.error(`Invalid message type`, message.messageType)
      break
  }
})
