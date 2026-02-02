//@ts-check

/**
 * @param {any} data
 */
function refresh(data) {
  let html = ''

  if (!data.websocket) {
    html += '<div><b>Not connected</b></div>'
  } else if (data.presences) {
    /**
     * @param {number} seconds
     * @returns {string}
     */
    const formatSecondsTimestamp = (seconds) => {
      const sec = Math.floor(seconds % 60)
      let mins = Math.floor(seconds / 60)
      let hours = 0
      if (mins >= 60) {
        hours = Math.floor(mins / 60)
        mins = Math.floor(mins % 60)
      }
      if (hours) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      } else {
        return `${mins}:${sec.toString().padStart(2, '0')}`
      }
    }

    for (const presence of data.presences) {
      let time = ''
      const now = Math.floor(Date.now() / 1000)
      if (presence.timestamps.start && presence.timestamps.end) {
        let percent = (now - presence.timestamps.start) / (presence.timestamps.end - presence.timestamps.start)
        if (Number.isNaN(percent)) percent = 0
        if (percent === -Infinity || percent < 0) percent = 0
        if (percent === Infinity || percent > 1) percent = 1
        percent *= 100
        time = `<div class="time-progress"><span>${formatSecondsTimestamp(now - presence.timestamps.start)}</span><div class="time-progress-bar"><div style="width: ${percent}%"></div></div><span>${formatSecondsTimestamp(presence.timestamps.end - presence.timestamps.start)}</span></div>`
      } else if (presence.timestamps.start) {
        time = `<div class="time">${formatSecondsTimestamp(now - presence.timestamps.start)} elapsed</div>`
      } else if (presence.timestamps.end) {
        time = `<div class="time">${formatSecondsTimestamp(presence.timestamps.end - now)} left</div>`
      }

      const details = !presence.details ? '' : '<div>' + presence.details + '</div>'

      const state = !presence.state ? '' : '<div>' + presence.state + '</div>'

      html += `
        <div class="horizontal">
          ${!presence.assets?.largeImageKey ? '' : `
          <div class="thumbnail">
            <img title="${presence.assets?.largeImageText}" width=64 height=64 src="${presence.assets?.largeImageKey}">
          </div>
          `}
          <div class="content">
            <h1>${details}</h1>
            <p>${state}</p>
            <p>YouTube Music</p>
            ${time}
          </div>
        </div>
      `
    }
  } else {
    html += `<div><b>No Presence Active</b></div>`
  }

  document.getElementById('main').innerHTML = html
}

function _() {
  browser.runtime.sendMessage({ messageType: 'REQUEST_UI' })
    .then(refresh)
    .finally(() => setTimeout(_, 1000))
}

_()
