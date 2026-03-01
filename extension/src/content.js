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

/** @type {import('./types').VideoInfo} */
let documentData = null

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
  const response = await fetch(`https://www.youtube.com/oembed?url=http%3A//youtube.com/watch%3Fv%3D${videoId}&format=json`)
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json()
}

/**
 * @param {HTMLElement} videoPlayer
 * @param {import('./types').VideoInfo} result
 */
function getLivestreamData(videoPlayer, result) {
  const miniplayerHTML = videoPlayer.querySelector(MINIPLAYER_ELEMENT_SELECTOR)
  if (!miniplayerHTML || (miniplayerHTML && miniplayerHTML.getAttribute("style") == NO_MINIPLAYER_ATTRIBUTE)) {
    /** @type {HTMLAnchorElement} */
    const titleHTML = videoPlayer.querySelector(MAIN_LIVESTREAM_TITLE_SELECTOR)
    /** @type {HTMLAnchorElement} */
    const authorHTML = document.querySelector(MAIN_LIVESTREAM_AUTHOR_SELECTOR)

    if (titleHTML) {
      result.title = titleHTML.innerText
    } else {
      result.title = null
    }

    if (authorHTML) {
      result.author = authorHTML.innerText
      result.channelUrl = authorHTML.href
    } else {
      result.author = null
    }
  } else if (miniplayerHTML && miniplayerHTML.getAttribute("style") == YES_MINIPLAYER_ATRRIBUTE) {
    /** @type {HTMLAnchorElement} */
    const titleHTML = videoPlayer.querySelector(MAIN_LIVESTREAM_TITLE_SELECTOR)
    /** @type {HTMLAnchorElement} */
    const authorHTML = document.querySelector(MINIPLAYER_LIVESTREAM_AUTHOR_SELECTOR)

    if (titleHTML) {
      result.title = titleHTML.innerText
    } else {
      result.title = null
    }

    if (authorHTML) {
      result.author = authorHTML.innerText
      result.channelUrl = authorHTML.href
    } else {
      result.author = null
    }
  }
}

/**
 * @param {import('./types').YouTubeVideoPlayer} videoPlayer
 * @param {import('./types').VideoInfo} result
 */
function getTimeData(videoPlayer, result) {
  if (videoPlayer.getDuration() && videoPlayer.getCurrentTime()) {
    result.duration = videoPlayer.getDuration()
    result.timeLeft = result.duration - videoPlayer.getCurrentTime()
    if (result.timeLeft < 0) {
      result.timeLeft = null
    }
  } else {
    result.timeLeft = null
    console.log("Unable to get timestamp data for YouTubeDiscordPresence")
  }
}

/**
 * @param {import('./types').VideoInfo} result
 */
function sendDocumentData(result) {
  if (result.title && result.author && result.timeLeft) {
    if (result.author.endsWith(" - Topic")) {
      result.author = result.author.slice(0, -8)
    }
    window.dispatchEvent(new CustomEvent("SendToLoader", { detail: result }))
  }
}

/**
 * @param {import('./types').YouTubeVideoPlayer} videoPlayer
 * @param {import('./types').VideoInfo} result
 */
function handleYouTubeData(videoPlayer, result) {
  const livestreamHTML = videoPlayer.querySelector(LIVESTREAM_ELEMENT_SELECTOR)
  result.videoId = getVideoId(videoPlayer.getVideoUrl())
  result.applicationType = window.location.href.includes("music.youtube") ? "youtubeMusic" : "youtube"
  result.playerState = videoPlayer.getPlayerState()

  if (result.applicationType == "youtubeMusic") { // GRABS YT MUSIC ALBUM THUMBNAIL
    const thumbnail = document.querySelector("#song-image #thumbnail #img")
    if (thumbnail && "src" in thumbnail && typeof thumbnail.src === 'string' && thumbnail.src.startsWith("https://lh3.googleusercontent.com/")) {
      result.thumbnailUrl = thumbnail.src
    } else {
      result.thumbnailUrl = `https://i.ytimg.com/vi/${result.videoId}/hqdefault.jpg`
    }
  } else {
    result.thumbnailUrl = `https://i.ytimg.com/vi/${result.videoId}/hqdefault.jpg`
  }

  if (!livestreamHTML) {
    getOEmbedJSON(result.videoId).then(data => { // TRY USING OEMBED FIRST
      result.title = data.title
      result.author = data.author_name
      result.channelUrl = data.author_url
      try {
        result.albumLinks = [...document.getElementsByTagName('ytmusic-player-bar').item(0).getElementsByTagName('a')].map(v => ({ link: v.href, text: v.textContent })).filter(v => v.link).filter(v => v.link.includes('browse/'))
      } catch (error) {
      }
      getTimeData(videoPlayer, result)
    }).catch(error => {
      getLivestreamData(videoPlayer, result)
      getTimeData(videoPlayer, result)
      console.error(error)
    })
  } else {
    getLivestreamData(videoPlayer, result)
    result.timeLeft = -1
  }
}

setInterval(() => {
  /** @type {import('./types').YouTubeVideoPlayer} */ // @ts-ignore
  const videoPlayer = document.getElementById("movie_player")
  if (videoPlayer && document.querySelector(AD_SELECTOR) == null) {
    handleYouTubeData(videoPlayer, documentData)
    sendDocumentData(documentData)
  }
}, NORMAL_MESSAGE_DELAY)
