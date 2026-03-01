export interface VideoInfo {
  albumLinks: Array<{
    link: string
    text: string
  }>
  thumbnailUrl: string
  playerState: number
  applicationType: 'youtubeMusic' | 'youtube'
  videoId: string
  timeLeft: number
  duration: number
  channelUrl: string
  author: string
  title: string
}

export interface Presence {
  type: 0 | 1 | 2 | 3 | 4 | 5
  statusDisplay?: 0 | 1 | 2
  details?: string
  detailsUrl?: string
  state?: string
  stateUrl?: string
  assets?: {
    largeImageText?: string
    largeImageUrl?: string
    largeImageKey?: string
    smallImageText?: string
    smallImageUrl?: string
    smallImageKey?: string
  }
  timestamps?: {
    start?: number
    end?: number
  }
  buttons?: Array<{
    label: string
    url?: string
  }>
  secrets?: {
    joinSecret?: string
    spectateSecret?: string
  }
  party?: {
    id?: string
    max?: number
    size?: number
    privacy?: 0 | 1
  }
}

export class YouTubeVideoPlayer extends HTMLDivElement {
  addCueRange: (...args: any[]) => any
  addEmbedsConversionTrackingParams: (...args: any[]) => any
  addEventListener: (...args: any[]) => any
  addUtcCueRange: (...args: any[]) => any
  assignedSlot: any
  canPlayType: (...args: any[]) => any
  cancelPlayback: (...args: any[]) => any
  channelSubscribed: (...args: any[]) => any
  channelUnsubscribed: (...args: any[]) => any
  clearQueue: (...args: any[]) => any
  clearVideo: (...args: any[]) => any
  confirmYpcRental: (...args: any[]) => any
  createClientVe: (...args: any[]) => any
  createServerVe: (...args: any[]) => any
  cuePlaylist: (...args: any[]) => any
  cueVideoById: (...args: any[]) => any
  cueVideoByPlayerVars: (...args: any[]) => any
  cueVideoByUrl: (...args: any[]) => any
  destroy: (...args: any[]) => any
  destroyVe: (...args: any[]) => any
  dismissFeaturedProductOverlay: (...args: any[]) => any
  dispatchReduxAction: (...args: any[]) => any
  enqueueVideoByPlayerVars: (...args: any[]) => any
  getAdState: (...args: any[]) => any
  getApiInterface: (...args: any[]) => any
  getAppState: (...args: any[]) => any
  getAudioQualitySettingState: (...args: any[]) => any
  getAudioTrack: (...args: any[]) => any
  getAudioTrackState: (...args: any[]) => any
  getAvailableAudioTracks: (...args: any[]) => any
  getAvailablePlaybackRates: (...args: any[]) => any
  getAvailableQualityData: (...args: any[]) => any
  getAvailableQualityDataAndMessaging: (...args: any[]) => any
  getAvailableQualityLabels: (...args: any[]) => any
  getAvailableQualityLevels: (...args: any[]) => any
  getCaptionWindowContainerId: (...args: any[]) => any
  getCurrentPlaylistSequence: (...args: any[]) => any
  getCurrentTime: () => any
  getDebugText: (...args: any[]) => any
  getDuration: () => any
  getEmbeddedPlayerResponse: (...args: any[]) => any
  getFeedbackProductData: (...args: any[]) => any
  getHeartbeatResponse: (...args: any[]) => any
  getInternalApiInterface: (...args: any[]) => any
  getLoopRange: (...args: any[]) => any
  getLoopVideo: (...args: any[]) => any
  getMaxPlaybackQuality: (...args: any[]) => any
  getMediaReferenceTime: (...args: any[]) => any
  getNumberOfStoryboardLevels: (...args: any[]) => any
  getOption: (...args: any[]) => any
  getOptions: (...args: any[]) => any
  getPaygatedAudioQualityData: (...args: any[]) => any
  getPlaybackQuality: (...args: any[]) => any
  getPlaybackQualityLabel: (...args: any[]) => any
  getPlaybackRate: (...args: any[]) => any
  getPlayerMode: (...args: any[]) => any
  getPlayerResponse: (...args: any[]) => any
  getPlayerSize: (...args: any[]) => any
  getPlayerState: () => any
  getPlayerStateObject: (...args: any[]) => any
  getPlaylist: (...args: any[]) => any
  getPlaylistId: (...args: any[]) => any
  getPlaylistIndex: (...args: any[]) => any
  getPlaylistSequenceForTime: (...args: any[]) => any
  getPreferredQuality: (...args: any[]) => any
  getPresentingPlayerType: (...args: any[]) => any
  getProgressState: (...args: any[]) => any
  getSize: (...args: any[]) => any
  getSphericalProperties: (...args: any[]) => any
  getStatsForNerds: (...args: any[]) => any
  getStoryboardFormat: (...args: any[]) => any
  getStoryboardFrame: (...args: any[]) => any
  getStoryboardFrameIndex: (...args: any[]) => any
  getStoryboardLevel: (...args: any[]) => any
  getStreamTimeOffset: (...args: any[]) => any
  getSubtitlesUserSettings: (...args: any[]) => any
  getTrustedApi: (...args: any[]) => any
  getUserAudioQualitySetting: (...args: any[]) => any
  getUserPlaybackQualityPreference: (...args: any[]) => any
  getVideoAspectRatio: (...args: any[]) => any
  getVideoBytesLoaded: (...args: any[]) => any
  getVideoBytesTotal: (...args: any[]) => any
  getVideoContentRect: (...args: any[]) => any
  getVideoData: (...args: any[]) => any
  getVideoEmbedCode: (...args: any[]) => any
  getVideoLoadedFraction: (...args: any[]) => any
  getVideoStartBytes: (...args: any[]) => any
  getVideoStats: (...args: any[]) => any
  getVideoUrl: () => any
  getVisibilityState: (...args: any[]) => any
  getVoiceBoostState: (...args: any[]) => any
  getVoiceBoostUserPreference: (...args: any[]) => any
  getVolume: (...args: any[]) => any
  getWatchNextResponse: (...args: any[]) => any
  getWebPlayerContextConfig: (...args: any[]) => any
  handleExternalCall: (...args: any[]) => any
  handleGlobalKeyDown: (...args: any[]) => any
  handleGlobalKeyUp: (...args: any[]) => any
  hasHqaAudioTrack: (...args: any[]) => any
  hasVe: (...args: any[]) => any
  hideControls: (...args: any[]) => any
  hideVideoInfo: (...args: any[]) => any
  highlightSettingsMenuItem: (...args: any[]) => any
  insertTimelyActionUi: (...args: any[]) => any
  isAtLiveHead: (...args: any[]) => any
  isConnected: boolean
  isExternalMethodAvailable: (...args: any[]) => any
  isFullscreen: (...args: any[]) => any
  isGaplessTransitionReady: (...args: any[]) => any
  isInline: (...args: any[]) => any
  isKeyboardDisabled: (...args: any[]) => any
  isLifaAdPlaying: (...args: any[]) => any
  isMuted: (...args: any[]) => any
  isMutedByEmbedsMutedAutoplay: (...args: any[]) => any
  isMutedByMutedAutoplay: (...args: any[]) => any
  isNotServable: (...args: any[]) => any
  isOrchestrationLeader: (...args: any[]) => any
  isSubtitlesOn: (...args: any[]) => any
  isVideoInfoVisible: (...args: any[]) => any
  loadModule: (...args: any[]) => any
  loadPlaylist: (...args: any[]) => any
  loadVideoById: (...args: any[]) => any
  loadVideoByPlayerVars: (...args: any[]) => any
  loadVideoByUrl: (...args: any[]) => any
  logApiCall: (...args: any[]) => any
  logClick: (...args: any[]) => any
  logImaAdEvent: (...args: any[]) => any
  logVisibility: (...args: any[]) => any
  musicDisableUi: (...args: any[]) => any
  musicEnableUi: (...args: any[]) => any
  mute: (...args: any[]) => any
  mutedAutoplay: (...args: any[]) => any
  nextVideo: (...args: any[]) => any
  notifyShortsAdSwipeEvent: (...args: any[]) => any
  onAdUxClicked: (...args: any[]) => any
  openSettingsMenuItem: (...args: any[]) => any
  pauseVideo: (...args: any[]) => any
  pauseVideoDownload: (...args: any[]) => any
  playVideo: (...args: any[]) => any
  playVideoAt: (...args: any[]) => any
  prefetchKeyPlay: (...args: any[]) => any
  prefix: any
  preloadVideoById: (...args: any[]) => any
  preloadVideoByPlayerVars: (...args: any[]) => any
  previousVideo: (...args: any[]) => any
  productsInVideoVisibilityUpdated: (...args: any[]) => any
  queueNextVideo: (...args: any[]) => any
  queueOfflineAction: (...args: any[]) => any
  refreshAllStaleEntities: (...args: any[]) => any
  removeCueRange: (...args: any[]) => any
  removeEventListener: (...args: any[]) => any
  reportPlaybackIssue: (...args: any[]) => any
  requestSeekToWallTimeSeconds: (...args: any[]) => any
  resetSubtitlesUserSettings: (...args: any[]) => any
  resumeVideoDownload: (...args: any[]) => any
  role: any
  seekBy: (...args: any[]) => any
  seekTo: (...args: any[]) => any
  seekToLiveHead: (...args: any[]) => any
  seekToStreamTime: (...args: any[]) => any
  sendAbandonmentPing: (...args: any[]) => any
  sendVideoStatsEngageEvent: (...args: any[]) => any
  setAccountLinkState: (...args: any[]) => any
  setAppFullscreen: (...args: any[]) => any
  setAudioTrack: (...args: any[]) => any
  setAutonav: (...args: any[]) => any
  setAutonavState: (...args: any[]) => any
  setBlackout: (...args: any[]) => any
  setCenterCrop: (...args: any[]) => any
  setCompositeParam: (...args: any[]) => any
  setCreatorEndscreenHideButton: (...args: any[]) => any
  setCreatorEndscreenVisibility: (...args: any[]) => any
  setFauxFullscreen: (...args: any[]) => any
  setGlobalCrop: (...args: any[]) => any
  setInline: (...args: any[]) => any
  setInlinePreview: (...args: any[]) => any
  setInternalSize: (...args: any[]) => any
  setLoop: (...args: any[]) => any
  setLoopRange: (...args: any[]) => any
  setLoopVideo: (...args: any[]) => any
  setMinimized: (...args: any[]) => any
  setOption: (...args: any[]) => any
  setOverlayVisibility: (...args: any[]) => any
  setPlaybackQuality: (...args: any[]) => any
  setPlaybackQualityRange: (...args: any[]) => any
  setPlaybackRate: (...args: any[]) => any
  setSafetyMode: (...args: any[]) => any
  setScreenLayer: (...args: any[]) => any
  setShuffle: (...args: any[]) => any
  setSize: (...args: any[]) => any
  setSizeStyle: (...args: any[]) => any
  setSphericalProperties: (...args: any[]) => any
  setSqueezeback: (...args: any[]) => any
  setTrackingParams: (...args: any[]) => any
  setUpPositionSyncInterval: (...args: any[]) => any
  setUserAudioQualitySetting: (...args: any[]) => any
  setUserEngagement: (...args: any[]) => any
  setVoiceBoostUserPreference: (...args: any[]) => any
  setVolume: (...args: any[]) => any
  shouldSendVisibilityState: (...args: any[]) => any
  showAirplayPicker: (...args: any[]) => any
  showControls: (...args: any[]) => any
  showVideoInfo: (...args: any[]) => any
  slot: string
  startSeekCsiAction: (...args: any[]) => any
  stopVideo: (...args: any[]) => any
  supportsGaplessAudio: (...args: any[]) => any
  supportsGaplessShorts: (...args: any[]) => any
  syncVolume: (...args: any[]) => any
  toggleFullscreen: (...args: any[]) => any
  togglePictureInPicture: (...args: any[]) => any
  toggleSubtitles: (...args: any[]) => any
  toggleSubtitlesOn: (...args: any[]) => any
  unMute: (...args: any[]) => any
  unloadModule: (...args: any[]) => any
  updateAccountLinkingConfig: (...args: any[]) => any
  updateDownloadState: (...args: any[]) => any
  updateEnvironmentData: (...args: any[]) => any
  updateFullerscreenEduButtonSubtleModeState: (...args: any[]) => any
  updateFullerscreenEduButtonVisibility: (...args: any[]) => any
  updateLastActiveTime: (...args: any[]) => any
  updatePlaylist: (...args: any[]) => any
  updateSubtitlesUserSettings: (...args: any[]) => any
  updateVideoData: (...args: any[]) => any
  wakeUpControls: (...args: any[]) => any
}
