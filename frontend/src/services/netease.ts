/**
 * 网易云音乐 API 服务
 * 连接到本地运行的 NeteaseCloudMusicApi
 */

// 检测是否在 Electron 或 Capacitor 桌面环境中运行
const isElectronOrCapacitor = typeof window !== 'undefined' && (
  window.navigator.userAgent.toLowerCase().includes('electron') ||
  window.location.protocol === 'capacitor-electron:' ||
  window.location.protocol === 'capacitor:' ||
  !window.location.origin.startsWith('http')
)

// 后端 API 地址
const BACKEND_URL = 'http://localhost:3000'

// 通用请求函数
async function request<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  // 构造 URL - 移除 endpoint 开头的 / 以正确拼接
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

  // 判断使用哪个 URL
  // - 如果是 Electron/Capacitor 桌面应用，直接访问后端
  // - 如果是 Web (http/https)，使用代理 /api
  let fullUrl: string
  if (isElectronOrCapacitor) {
    fullUrl = `${BACKEND_URL}/${cleanEndpoint}`
  } else {
    fullUrl = `${window.location.origin}/api/${cleanEndpoint}`
  }

  const url = new URL(fullUrl)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  const response = await fetch(url.toString(), {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}

// ==================== 搜索 ====================

export type SearchType = 1 | 10 | 100 | 1000 | 1002 | 1004 | 1006 | 1009 | 1014 | 1018 | 2000
// 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018: 综合, 2000: 声音

export async function search(keywords: string, type: SearchType = 1, limit = 30, offset = 0) {
  return request<any>('/search', { keywords, type, limit, offset })
}

export async function searchSuggest(keywords: string) {
  return request<any>('/search/suggest', { keywords })
}

export async function searchHot() {
  return request<any>('/search/hot/detail')
}

export async function searchPlaylists(keywords: string, limit = 30, offset = 0) {
  return request<any>('/search', { keywords, type: 1000, limit, offset })
}

// ==================== 歌曲 ====================

export async function getSongUrl(id: number | number[], level = 'exhigh') {
  const ids = Array.isArray(id) ? id.join(',') : id
  return request<any>('/song/url/v1', { id: ids, level })
}

export async function getSongDetail(ids: number | number[]) {
  const idsStr = Array.isArray(ids) ? ids.join(',') : ids
  return request<any>('/song/detail', { ids: idsStr })
}

export async function getLyric(id: number) {
  return request<any>('/lyric', { id })
}

export async function checkMusic(id: number) {
  return request<any>('/check/music', { id })
}

export async function getSimiSong(id: number) {
  return request<any>('/simi/song', { id })
}

// ==================== 歌单 ====================

export async function getPlaylistDetail(id: number) {
  return request<any>('/playlist/detail', { id })
}

export async function getPlaylistTracks(id: number, limit = 100, offset = 0) {
  return request<any>('/playlist/track/all', { id, limit, offset })
}

export async function getTopPlaylists(cat = '全部', limit = 50, offset = 0) {
  return request<any>('/top/playlist', { cat, limit, offset })
}

export async function getPlaylistCatlist() {
  return request<any>('/playlist/catlist')
}

export async function getHighqualityPlaylists(cat = '全部', limit = 20) {
  return request<any>('/top/playlist/highquality', { cat, limit })
}

export async function createPlaylist(name: string, privacy = 0) {
  return request<any>('/playlist/create', { name, privacy })
}

export async function deletePlaylist(id: number) {
  return request<any>('/playlist/delete', { id })
}

export async function updatePlaylist(id: number, name: string, desc?: string, tags?: string) {
  return request<any>('/playlist/update', { id, name, desc, tags })
}

export async function addTracksToPlaylist(pid: number, tracks: number[], op: 'add' | 'del' = 'add') {
  return request<any>('/playlist/tracks', { pid, tracks: tracks.join(','), op })
}

export async function subscribePlaylist(id: number, t: 1 | 2) {
  return request<any>('/playlist/subscribe', { id, t })
}

// ==================== 推荐 ====================

export async function getPersonalized(limit = 30) {
  return request<any>('/personalized', { limit })
}

export async function getPersonalizedNewSongs(limit = 10) {
  return request<any>('/personalized/newsong', { limit })
}

// 热门歌单（不需要登录）
export async function getHotPlaylists(limit = 30, offset = 0) {
  return request<any>('/top/playlist', { limit, offset, order: 'hot' })
}

export async function getRecommendSongs() {
  return request<any>('/recommend/songs')
}

export async function getRecommendResource() {
  return request<any>('/recommend/resource')
}

export async function getPersonalFm() {
  return request<any>('/personal_fm')
}

export async function fmTrash(id: number) {
  return request<any>('/fm_trash', { id })
}

export async function getHeartbeatList(id: number, pid: number) {
  return request<any>('/playmode/intelligence/list', { id, pid })
}

// ==================== 排行榜 ====================

export async function getToplist() {
  return request<any>('/toplist')
}

export async function getToplistDetail() {
  return request<any>('/toplist/detail')
}

export async function getTopSongs(type = 0) {
  return request<any>('/top/song', { type })
}

// ==================== 歌手 ====================

export async function getArtistDetail(id: number) {
  return request<any>('/artist/detail', { id })
}

export async function getArtistSongs(id: number, limit = 50, offset = 0, order = 'hot') {
  return request<any>('/artist/songs', { id, limit, offset, order })
}

export async function getArtistAlbums(id: number, limit = 30, offset = 0) {
  return request<any>('/artist/album', { id, limit, offset })
}

export async function getArtistMvs(id: number, limit = 30, offset = 0) {
  return request<any>('/artist/mv', { id, limit, offset })
}

export async function getArtistDesc(id: number) {
  return request<any>('/artist/desc', { id })
}

export async function getTopArtists(limit = 100, offset = 0) {
  return request<any>('/top/artists', { limit, offset })
}

export async function getArtistList(type = -1, area = -1, initial = '', limit = 30, offset = 0) {
  return request<any>('/artist/list', { type, area, initial, limit, offset })
}

export async function followArtist(id: number, t: 1 | 0) {
  return request<any>('/artist/sub', { id, t })
}

export async function getSimiArtist(id: number) {
  return request<any>('/simi/artist', { id })
}

// ==================== 专辑 ====================

export async function getAlbum(id: number) {
  return request<any>('/album', { id })
}

export async function getNewAlbums(area = 'ALL', limit = 30, offset = 0) {
  return request<any>('/album/new', { area, limit, offset })
}

export async function getNewestAlbums() {
  return request<any>('/album/newest')
}

export async function subscribeAlbum(id: number, t: 1 | 0) {
  return request<any>('/album/sub', { id, t })
}

// ==================== 评论 ====================

export async function getMusicComments(id: number, limit = 20, offset = 0, before?: number) {
  return request<any>('/comment/music', { id, limit, offset, before })
}

export async function getPlaylistComments(id: number, limit = 20, offset = 0, before?: number) {
  return request<any>('/comment/playlist', { id, limit, offset, before })
}

export async function getAlbumComments(id: number, limit = 20, offset = 0) {
  return request<any>('/comment/album', { id, limit, offset })
}

export async function getMvComments(id: number, limit = 20, offset = 0) {
  return request<any>('/comment/mv', { id, limit, offset })
}

export async function getHotComments(id: number, type: 0 | 1 | 2 | 3, limit = 20, offset = 0) {
  return request<any>('/comment/hot', { id, type, limit, offset })
}

export async function likeComment(id: number, cid: number, t: 1 | 0, type: 0 | 1 | 2 | 3) {
  return request<any>('/comment/like', { id, cid, t, type })
}

export async function sendComment(
  t: 1 | 2,
  type: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  id: number,
  content: string,
  commentId?: number
) {
  return request<any>('/comment', { t, type, id, content, commentId })
}

export async function deleteComment(t: 0 | 1 | 2 | 3, id: number, commentId: number) {
  return request<any>('/comment', { t: 0, type: t, id, commentId })
}

// ==================== MV ====================

export async function getMvUrl(id: number, r = 1080) {
  return request<any>('/mv/url', { id, r })
}

export async function getMvDetail(mvid: number) {
  return request<any>('/mv/detail', { mvid })
}

export async function getAllMvs(area = '', type = '', order = '', limit = 30, offset = 0) {
  return request<any>('/mv/all', { area, type, order, limit, offset })
}

export async function getRecommendMvs() {
  return request<any>('/personalized/mv')
}

export async function getNewMvs(area = '', limit = 30) {
  return request<any>('/mv/first', { area, limit })
}

export async function subscribeMv(mvid: number, t: 1 | 0) {
  return request<any>('/mv/sub', { mvid, t })
}

export async function getMvRanking(area = '', limit = 30, offset = 0) {
  return request<any>('/top/mv', { area, limit, offset })
}

// ==================== 用户 ====================

export async function getUserDetail(uid: number) {
  return request<any>('/user/detail', { uid })
}

export async function getUserPlaylists(uid: number, limit = 30, offset = 0) {
  return request<any>('/user/playlist', { uid, limit, offset })
}

export async function getUserFollows(uid: number, limit = 30, offset = 0) {
  return request<any>('/user/follows', { uid, limit, offset })
}

export async function getUserFolloweds(uid: number, limit = 30) {
  return request<any>('/user/followeds', { uid, limit })
}

export async function getUserRecord(uid: number, type = 1) {
  return request<any>('/user/record', { uid, type })
}

export async function getUserSubcount() {
  return request<any>('/user/subcount')
}

export async function followUser(id: number, t: 1 | 0) {
  return request<any>('/follow', { id, t })
}

export async function getUserLevel() {
  return request<any>('/user/level')
}

// ==================== 登录 ====================

export async function getLoginStatus() {
  return request<any>('/login/status')
}

export async function getQRKey() {
  return request<any>('/login/qr/key', { timestamp: Date.now() })
}

export async function createQRCode(key: string, qrimg = true) {
  return request<any>('/login/qr/create', { key, qrimg, timestamp: Date.now() })
}

export async function checkQRCode(key: string) {
  return request<any>('/login/qr/check', { key, timestamp: Date.now() })
}

export async function loginWithPhone(phone: string, password?: string, captcha?: string) {
  if (captcha) {
    return request<any>('/login/cellphone', { phone, captcha })
  }
  return request<any>('/login/cellphone', { phone, password })
}

export async function sendCaptcha(phone: string) {
  return request<any>('/captcha/sent', { phone })
}

export async function verifyCaptcha(phone: string, captcha: string) {
  return request<any>('/captcha/verify', { phone, captcha })
}

export async function logout() {
  return request<any>('/logout')
}

export async function refreshLogin() {
  return request<any>('/login/refresh')
}

export async function getAccount() {
  return request<any>('/user/account')
}

// ==================== 喜欢 ====================

export async function likeSong(id: number, like = true) {
  return request<any>('/like', { id, like })
}

export async function getLikeList(uid: number) {
  return request<any>('/likelist', { uid })
}

// ==================== 播放记录 ====================

export async function scrobble(id: number, sourceid: number, time = 0) {
  return request<any>('/scrobble', { id, sourceid, time })
}

// ==================== Banner ====================

export async function getBanner(type = 0) {
  return request<any>('/banner', { type })
}

// ==================== 电台/播客 ====================

export async function getDjBanner() {
  return request<any>('/dj/banner')
}

export async function getDjRecommend() {
  return request<any>('/dj/recommend')
}

export async function getDjCatelist() {
  return request<any>('/dj/catelist')
}

export async function getDjProgram(rid: number, limit = 30, offset = 0) {
  return request<any>('/dj/program', { rid, limit, offset })
}

export async function getDjDetail(rid: number) {
  return request<any>('/dj/detail', { rid })
}

export async function getDjProgramDetail(id: number) {
  return request<any>('/dj/program/detail', { id })
}

export async function getDjHot(limit = 30, offset = 0) {
  return request<any>('/dj/hot', { limit, offset })
}

export async function getDjToplist(type = 'new', limit = 100) {
  return request<any>('/dj/toplist', { type, limit })
}

export async function subscribeDj(rid: number, t: 1 | 0) {
  return request<any>('/dj/sub', { rid, t })
}

// ==================== 私信 ====================

export async function getPrivateMessages(limit = 30, offset = 0) {
  return request<any>('/msg/private', { limit, offset })
}

export async function sendPrivateMessage(user_ids: number[], msg: string) {
  return request<any>('/send/text', { user_ids: user_ids.join(','), msg })
}

export async function getRecentMessages() {
  return request<any>('/msg/recentcontact')
}

export async function getPrivateHistory(uid: number, limit = 30, before?: number) {
  return request<any>('/msg/private/history', { uid, limit, before })
}

// ==================== 通知 ====================

export async function getNotifications(limit = 30, lasttime = -1) {
  return request<any>('/msg/notices', { limit, lasttime })
}

// ==================== 云盘 ====================

export async function getCloudSongs(limit = 100, offset = 0) {
  return request<any>('/user/cloud', { limit, offset })
}

export async function getCloudSongDetail(id: number) {
  return request<any>('/user/cloud/detail', { id })
}

export async function deleteCloudSong(id: number) {
  return request<any>('/user/cloud/del', { id })
}

// ==================== 动态 ====================

export async function getEvent(pagesize = 20, lasttime = -1) {
  return request<any>('/event', { pagesize, lasttime })
}

export async function getUserEvents(uid: number, limit = 30, lasttime = -1) {
  return request<any>('/user/event', { uid, limit, lasttime })
}

export async function shareResource(type: string, id: number, msg?: string) {
  return request<any>('/share/resource', { type, id, msg })
}

export async function likeEvent(threadId: string, t: 1 | 0) {
  return request<any>('/resource/like', { threadId, t })
}

export async function forwardEvent(evId: number, forwards: string) {
  return request<any>('/event/forward', { evId, forwards })
}

// ==================== 收藏 ====================

export async function getSubAlbums(limit = 25, offset = 0) {
  return request<any>('/album/sublist', { limit, offset })
}

export async function getSubArtists(limit = 25, offset = 0) {
  return request<any>('/artist/sublist', { limit, offset })
}

export async function getSubMvs(limit = 25, offset = 0) {
  return request<any>('/mv/sublist', { limit, offset })
}

export async function getSubDjs(limit = 25, offset = 0) {
  return request<any>('/dj/sublist', { limit, offset })
}

// ==================== 日推历史 ====================

export async function getHistoryRecommendSongs(date?: string) {
  return request<any>('/history/recommend/songs', { date })
}

export async function getHistoryRecommendSongsDetail(date: string) {
  return request<any>('/history/recommend/songs/detail', { date })
}

// ==================== 听歌打卡 ====================

export async function dailySignin(type = 0) {
  return request<any>('/daily_signin', { type })
}

// ==================== 工具函数 ====================

export interface FormattedSong {
  id: number
  title: string
  name: string
  artist: string
  artists: any[]
  album: string
  albumId?: number
  cover: string
  duration: number
  isVip: boolean
  mvId: number
  url?: string
}

export function formatSong(song: any): FormattedSong {
  return {
    id: song.id,
    title: song.name,
    name: song.name,
    artist: song.ar?.[0]?.name || song.artists?.[0]?.name || '未知歌手',
    artists: song.ar || song.artists || [],
    album: song.al?.name || song.album?.name || '未知专辑',
    albumId: song.al?.id || song.album?.id,
    cover: song.al?.picUrl || song.album?.picUrl || song.picUrl || '',
    duration: Math.floor((song.dt || song.duration) / 1000),
    isVip: song.fee === 1,
    mvId: song.mv || song.mvid || 0,
  }
}

export function formatPlaylist(playlist: any) {
  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description || '',
    cover: playlist.coverImgUrl || playlist.picUrl || '',
    songCount: playlist.trackCount,
    playCount: playlist.playCount,
    creator: {
      id: playlist.creator?.userId || playlist.userId,
      name: playlist.creator?.nickname || '',
      avatar: playlist.creator?.avatarUrl || '',
    },
  }
}

export function formatArtist(artist: any) {
  return {
    id: artist.id,
    name: artist.name,
    avatar: artist.img1v1Url || artist.picUrl || '',
    followed: artist.followed || false,
    albumCount: artist.albumSize || 0,
    mvCount: artist.mvSize || 0,
  }
}

export function formatAlbum(album: any) {
  return {
    id: album.id,
    name: album.name,
    cover: album.picUrl || album.blurPicUrl || '',
    artist: album.artist?.name || album.artists?.[0]?.name || '',
    artistId: album.artist?.id || album.artists?.[0]?.id,
    publishTime: album.publishTime,
    songCount: album.size,
    description: album.description || '',
  }
}

export function formatComment(comment: any) {
  return {
    id: comment.commentId,
    content: comment.content,
    time: comment.time,
    likeCount: comment.likedCount,
    liked: comment.liked,
    user: {
      id: comment.user?.userId,
      name: comment.user?.nickname,
      avatar: comment.user?.avatarUrl,
    },
    beReplied: comment.beReplied?.[0] ? {
      content: comment.beReplied[0].content,
      user: {
        id: comment.beReplied[0].user?.userId,
        name: comment.beReplied[0].user?.nickname,
      },
    } : null,
  }
}

export function formatMv(mv: any) {
  return {
    id: mv.id,
    name: mv.name,
    cover: mv.cover || mv.imgurl || mv.imgurl16v9 || '',
    artist: mv.artistName || mv.artists?.[0]?.name || '',
    artistId: mv.artistId || mv.artists?.[0]?.id,
    playCount: mv.playCount,
    duration: mv.duration,
  }
}

export function parseLyric(lrc: string): Array<{ time: number; text: string }> {
  if (!lrc) return []

  const lines = lrc.split('\n')
  const result: Array<{ time: number; text: string }> = []
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g

  for (const line of lines) {
    const matches = [...line.matchAll(timeRegex)]
    if (matches.length === 0) continue

    const text = line.replace(timeRegex, '').trim()
    if (!text) continue

    for (const match of matches) {
      const minutes = parseInt(match[1])
      const seconds = parseInt(match[2])
      const ms = parseInt(match[3].padEnd(3, '0'))
      const time = minutes * 60 + seconds + ms / 1000

      result.push({ time, text })
    }
  }

  return result.sort((a, b) => a.time - b.time)
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatPlayCount(count: number): string {
  if (count >= 100000000) {
    return `${(count / 100000000).toFixed(1)}亿`
  }
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`
  }
  return count.toString()
}
