// Source: https://github.com/XFG16/YouTubeDiscordPresence License: LICENSE.1

const VIDEO_ID_SEPARATOR_KEY = "v="
const PLAYLIST_SEPRATOR_KEY = "&"
const NORMAL_MESSAGE_DELAY = 5000

const AD_SELECTOR = "div.ytp-ad-player-overlay-instream-info" // DOCUMENT; THIS HAS TO BE DONE BECAUSE IF AN AD PLAYS IN THE MIDDLE OF A VIDEO, THEN GETPLAYERSTATE WILL STILL RETURN 1
const LIVESTREAM_ELEMENT_SELECTOR = "div.ytp-chrome-bottom > div.ytp-chrome-controls > div.ytp-left-controls > div.ytp-time-display.notranslate.ytp-live > button" // VIDEO PLAYER
const MINIPLAYER_ELEMENT_SELECTOR = "div.ytp-miniplayer-ui" // VIDEO PLAYER
const MAIN_LIVESTREAM_TITLE_SELECTOR = "div.ytp-chrome-top > div.ytp-title > div.ytp-title-text > a.ytp-title-link" // VIDEO PLAYER
const MAIN_LIVESTREAM_AUTHOR_SELECTOR = "#upload-info > #channel-name > #container > #text-container > #text > a" // DOCUMENT HTML
const MINIPLAYER_LIVESTREAM_AUTHOR_SELECTOR = "#video-container #info-bar #owner-name" // DOCUMENT HTML
const NO_MINIPLAYER_ATTRIBUTE = "display: none;"
const YES_MINIPLAYER_ATRRIBUTE = ""

/** @type {any} */
let documentData = new Object()
let videoPlayer = document.getElementById("movie_player")
let shouldSendData = 0

/**
 * @param {string} url
 * @returns {string | null}
 */
function getVideoId(url) {
  if (url.includes(VIDEO_ID_SEPARATOR_KEY)) {
    return url.split(VIDEO_ID_SEPARATOR_KEY)[1]
  }
  return null
}

/**
 * @param {string} videoId
 * @return {Promise<any>}
 */
async function getOEmbedJSON(videoId) {
  const response = await fetch("https://www.youtube.com/oembed?url=http%3A//youtube.com/watch%3Fv%3D" + videoId + "&format=json")
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json()
}

function getLivestreamData() {
  const miniplayerHTML = videoPlayer.querySelector(MINIPLAYER_ELEMENT_SELECTOR)
  if (!miniplayerHTML || (miniplayerHTML && miniplayerHTML.getAttribute("style") == NO_MINIPLAYER_ATTRIBUTE)) {
    /** @type {HTMLAnchorElement} */
    const titleHTML = videoPlayer.querySelector(MAIN_LIVESTREAM_TITLE_SELECTOR)
    /** @type {HTMLAnchorElement} */
    const authorHTML = document.querySelector(MAIN_LIVESTREAM_AUTHOR_SELECTOR)

    if (titleHTML) {
      documentData.title = titleHTML.innerText
    } else {
      documentData.title = null
    }

    if (authorHTML) {
      documentData.author = authorHTML.innerText
      documentData.channelUrl = authorHTML.href
    } else {
      documentData.author = null
    }
  } else if (miniplayerHTML && miniplayerHTML.getAttribute("style") == YES_MINIPLAYER_ATRRIBUTE) {
    /** @type {HTMLAnchorElement} */
    const titleHTML = videoPlayer.querySelector(MAIN_LIVESTREAM_TITLE_SELECTOR)
    /** @type {HTMLAnchorElement} */
    const authorHTML = document.querySelector(MINIPLAYER_LIVESTREAM_AUTHOR_SELECTOR)

    if (titleHTML) {
      documentData.title = titleHTML.innerText
    } else {
      documentData.title = null
    }

    if (authorHTML) {
      documentData.author = authorHTML.innerText
      documentData.channelUrl = authorHTML.href
    } else {
      documentData.author = null
    }
  }
}

function getTimeData() {
  if (videoPlayer.getDuration() && videoPlayer.getCurrentTime()) {
    documentData.duration = videoPlayer.getDuration()
    documentData.timeLeft = documentData.duration - videoPlayer.getCurrentTime()
    if (documentData.timeLeft < 0) {
      documentData.timeLeft = null
    }
  } else {
    documentData.timeLeft = null
    console.log("Unable to get timestamp data for YouTubeDiscordPresence")
  }
}

function sendDocumentData() {
  if (documentData.title && documentData.author && documentData.timeLeft) {
    if (documentData.author.endsWith(" - Topic")) {
      documentData.author = documentData.author.slice(0, -8)
    }
    window.dispatchEvent(new CustomEvent("SendToLoader", { detail: documentData }))
  }
}

function handleYouTubeData() {
  const livestreamHTML = videoPlayer.querySelector(LIVESTREAM_ELEMENT_SELECTOR)
  documentData.videoId = getVideoId(videoPlayer.getVideoUrl())
  documentData.applicationType = window.location.href.includes("music.youtube") ? "youtubeMusic" : "youtube"
  documentData.playerState = videoPlayer.getPlayerState()

  if (documentData.applicationType == "youtubeMusic") { // GRABS YT MUSIC ALBUM THUMBNAIL
    const thumbnail = document.querySelector("#song-image #thumbnail #img")
    if (thumbnail && "src" in thumbnail && thumbnail.src.startsWith("https://lh3.googleusercontent.com/")) {
      documentData.thumbnailUrl = thumbnail.src
    } else {
      documentData.thumbnailUrl = `https://i.ytimg.com/vi/${documentData.videoId}/hqdefault.jpg`
    }
  } else {
    documentData.thumbnailUrl = `https://i.ytimg.com/vi/${documentData.videoId}/hqdefault.jpg`
  }

  if (!livestreamHTML) {
    getOEmbedJSON(documentData.videoId).then(data => { // TRY USING OEMBED FIRST
      documentData.title = data.title
      documentData.author = data.author_name
      documentData.channelUrl = data.author_url
      getTimeData()
      sendDocumentData()
    }).catch(error => {
      getLivestreamData()
      getTimeData()
      sendDocumentData()
      console.error(error)
    })
  } else {
    getLivestreamData()
    documentData.timeLeft = -1
    sendDocumentData()
  }
}

setInterval(() => {
  videoPlayer = document.getElementById("movie_player")
  if (videoPlayer && document.querySelector(AD_SELECTOR) == null) {
    handleYouTubeData()
  }
}, NORMAL_MESSAGE_DELAY)
