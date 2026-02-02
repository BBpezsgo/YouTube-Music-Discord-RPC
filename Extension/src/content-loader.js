// Source: https://github.com/XFG16/YouTubeDiscordPresence License: LICENSE.1

window.addEventListener("SendToLoader", (/** @type {CustomEvent} */ message) => {
  browser.runtime.sendMessage({
    messageType: 'UPDATE_PRESENCE_DATA',
    detail: message.detail,
  })
}, false)

const mainScript = document.createElement("script")
mainScript.src = browser.runtime.getURL("/src/content.js");
(document.head || document.documentElement).appendChild(mainScript)
mainScript.onload = function () {
  this.remove()
}
