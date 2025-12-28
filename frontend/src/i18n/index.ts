import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 支持的语言
export type Locale = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP' | 'ko-KR'

// 语言配置
export const locales: Record<Locale, { name: string; nativeName: string }> = {
  'zh-CN': { name: 'Chinese (Simplified)', nativeName: '简体中文' },
  'zh-TW': { name: 'Chinese (Traditional)', nativeName: '繁體中文' },
  'en-US': { name: 'English (US)', nativeName: 'English' },
  'ja-JP': { name: 'Japanese', nativeName: '日本語' },
  'ko-KR': { name: 'Korean', nativeName: '한국어' },
}

// 翻译类型
type TranslationKey = keyof typeof translations['zh-CN']

// 翻译文本
const translations = {
  'zh-CN': {
    // 通用
    'common.loading': '加载中...',
    'common.error': '出错了',
    'common.retry': '重试',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.share': '分享',
    'common.search': '搜索',
    'common.more': '更多',
    'common.back': '返回',
    'common.next': '下一步',
    'common.done': '完成',

    // 导航
    'nav.home': '首页',
    'nav.explore': '发现',
    'nav.library': '音乐库',
    'nav.profile': '我的',
    'nav.search': '搜索音乐',
    'nav.toplist': '排行榜',
    'nav.settings': '设置',

    // 播放器
    'player.play': '播放',
    'player.pause': '暂停',
    'player.next': '下一首',
    'player.previous': '上一首',
    'player.shuffle': '随机播放',
    'player.repeat': '循环播放',
    'player.repeatOne': '单曲循环',
    'player.queue': '播放队列',
    'player.lyrics': '歌词',
    'player.volume': '音量',
    'player.quality': '音质',
    'player.playbackRate': '播放速度',
    'player.timer': '定时关闭',

    // 歌曲
    'song.like': '喜欢',
    'song.unlike': '取消喜欢',
    'song.download': '下载',
    'song.addToPlaylist': '添加到歌单',
    'song.playNext': '下一首播放',
    'song.addToQueue': '添加到播放队列',
    'song.viewArtist': '查看歌手',
    'song.viewAlbum': '查看专辑',
    'song.comment': '评论',

    // 歌单
    'playlist.create': '创建歌单',
    'playlist.edit': '编辑歌单',
    'playlist.delete': '删除歌单',
    'playlist.songs': '{count} 首歌曲',
    'playlist.playAll': '播放全部',
    'playlist.shufflePlay': '随机播放',
    'playlist.subscribe': '收藏',
    'playlist.unsubscribe': '取消收藏',

    // 用户
    'user.login': '登录',
    'user.register': '注册',
    'user.logout': '退出登录',
    'user.profile': '个人主页',
    'user.settings': '设置',
    'user.followers': '粉丝',
    'user.following': '关注',
    'user.follow': '关注',
    'user.unfollow': '取消关注',

    // 设置
    'settings.theme': '主题',
    'settings.themeLight': '浅色',
    'settings.themeDark': '深色',
    'settings.themeSystem': '跟随系统',
    'settings.language': '语言',
    'settings.quality': '音质设置',
    'settings.download': '下载设置',
    'settings.notification': '通知设置',
    'settings.privacy': '隐私设置',
    'settings.about': '关于',
    'settings.feedback': '意见反馈',

    // 消息
    'message.success': '操作成功',
    'message.error': '操作失败',
    'message.copied': '已复制',
    'message.saved': '已保存',
    'message.deleted': '已删除',
    'message.added': '已添加',
    'message.removed': '已移除',
    'message.downloaded': '下载完成',
    'message.networkError': '网络错误',
    'message.loginRequired': '请先登录',

    // 空状态
    'empty.noSongs': '暂无歌曲',
    'empty.noPlaylists': '暂无歌单',
    'empty.noResults': '暂无搜索结果',
    'empty.noHistory': '暂无播放历史',
    'empty.noDownloads': '暂无下载',
    'empty.noComments': '暂无评论',
  },

  'en-US': {
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.share': 'Share',
    'common.search': 'Search',
    'common.more': 'More',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.done': 'Done',

    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.library': 'Library',
    'nav.profile': 'Profile',
    'nav.search': 'Search Music',
    'nav.toplist': 'Charts',
    'nav.settings': 'Settings',

    'player.play': 'Play',
    'player.pause': 'Pause',
    'player.next': 'Next',
    'player.previous': 'Previous',
    'player.shuffle': 'Shuffle',
    'player.repeat': 'Repeat',
    'player.repeatOne': 'Repeat One',
    'player.queue': 'Queue',
    'player.lyrics': 'Lyrics',
    'player.volume': 'Volume',
    'player.quality': 'Quality',
    'player.playbackRate': 'Playback Speed',
    'player.timer': 'Sleep Timer',

    'song.like': 'Like',
    'song.unlike': 'Unlike',
    'song.download': 'Download',
    'song.addToPlaylist': 'Add to Playlist',
    'song.playNext': 'Play Next',
    'song.addToQueue': 'Add to Queue',
    'song.viewArtist': 'View Artist',
    'song.viewAlbum': 'View Album',
    'song.comment': 'Comment',

    'playlist.create': 'Create Playlist',
    'playlist.edit': 'Edit Playlist',
    'playlist.delete': 'Delete Playlist',
    'playlist.songs': '{count} songs',
    'playlist.playAll': 'Play All',
    'playlist.shufflePlay': 'Shuffle Play',
    'playlist.subscribe': 'Subscribe',
    'playlist.unsubscribe': 'Unsubscribe',

    'user.login': 'Login',
    'user.register': 'Register',
    'user.logout': 'Logout',
    'user.profile': 'Profile',
    'user.settings': 'Settings',
    'user.followers': 'Followers',
    'user.following': 'Following',
    'user.follow': 'Follow',
    'user.unfollow': 'Unfollow',

    'settings.theme': 'Theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeSystem': 'System',
    'settings.language': 'Language',
    'settings.quality': 'Audio Quality',
    'settings.download': 'Download',
    'settings.notification': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.about': 'About',
    'settings.feedback': 'Feedback',

    'message.success': 'Success',
    'message.error': 'Error',
    'message.copied': 'Copied',
    'message.saved': 'Saved',
    'message.deleted': 'Deleted',
    'message.added': 'Added',
    'message.removed': 'Removed',
    'message.downloaded': 'Downloaded',
    'message.networkError': 'Network Error',
    'message.loginRequired': 'Please login first',

    'empty.noSongs': 'No songs',
    'empty.noPlaylists': 'No playlists',
    'empty.noResults': 'No results',
    'empty.noHistory': 'No history',
    'empty.noDownloads': 'No downloads',
    'empty.noComments': 'No comments',
  },

  'zh-TW': {
    'common.loading': '載入中...',
    'common.error': '出錯了',
    'common.retry': '重試',
    'common.cancel': '取消',
    'common.confirm': '確認',
    'common.save': '儲存',
    'common.delete': '刪除',
    'common.edit': '編輯',
    'common.share': '分享',
    'common.search': '搜尋',
    'common.more': '更多',
    'common.back': '返回',
    'common.next': '下一步',
    'common.done': '完成',

    'nav.home': '首頁',
    'nav.explore': '發現',
    'nav.library': '音樂庫',
    'nav.profile': '我的',
    'nav.search': '搜尋音樂',
    'nav.toplist': '排行榜',
    'nav.settings': '設定',

    'player.play': '播放',
    'player.pause': '暫停',
    'player.next': '下一首',
    'player.previous': '上一首',
    'player.shuffle': '隨機播放',
    'player.repeat': '循環播放',
    'player.repeatOne': '單曲循環',
    'player.queue': '播放佇列',
    'player.lyrics': '歌詞',
    'player.volume': '音量',
    'player.quality': '音質',
    'player.playbackRate': '播放速度',
    'player.timer': '定時關閉',

    'song.like': '喜歡',
    'song.unlike': '取消喜歡',
    'song.download': '下載',
    'song.addToPlaylist': '加入歌單',
    'song.playNext': '下一首播放',
    'song.addToQueue': '加入播放佇列',
    'song.viewArtist': '檢視歌手',
    'song.viewAlbum': '檢視專輯',
    'song.comment': '評論',

    'playlist.create': '建立歌單',
    'playlist.edit': '編輯歌單',
    'playlist.delete': '刪除歌單',
    'playlist.songs': '{count} 首歌曲',
    'playlist.playAll': '播放全部',
    'playlist.shufflePlay': '隨機播放',
    'playlist.subscribe': '收藏',
    'playlist.unsubscribe': '取消收藏',

    'user.login': '登入',
    'user.register': '註冊',
    'user.logout': '登出',
    'user.profile': '個人主頁',
    'user.settings': '設定',
    'user.followers': '粉絲',
    'user.following': '關注',
    'user.follow': '關注',
    'user.unfollow': '取消關注',

    'settings.theme': '主題',
    'settings.themeLight': '淺色',
    'settings.themeDark': '深色',
    'settings.themeSystem': '跟隨系統',
    'settings.language': '語言',
    'settings.quality': '音質設定',
    'settings.download': '下載設定',
    'settings.notification': '通知設定',
    'settings.privacy': '隱私設定',
    'settings.about': '關於',
    'settings.feedback': '意見回饋',

    'message.success': '操作成功',
    'message.error': '操作失敗',
    'message.copied': '已複製',
    'message.saved': '已儲存',
    'message.deleted': '已刪除',
    'message.added': '已加入',
    'message.removed': '已移除',
    'message.downloaded': '下載完成',
    'message.networkError': '網路錯誤',
    'message.loginRequired': '請先登入',

    'empty.noSongs': '暫無歌曲',
    'empty.noPlaylists': '暫無歌單',
    'empty.noResults': '暫無搜尋結果',
    'empty.noHistory': '暫無播放歷史',
    'empty.noDownloads': '暫無下載',
    'empty.noComments': '暫無評論',
  },

  'ja-JP': {
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.retry': '再試行',
    'common.cancel': 'キャンセル',
    'common.confirm': '確認',
    'common.save': '保存',
    'common.delete': '削除',
    'common.edit': '編集',
    'common.share': '共有',
    'common.search': '検索',
    'common.more': 'もっと見る',
    'common.back': '戻る',
    'common.next': '次へ',
    'common.done': '完了',

    'nav.home': 'ホーム',
    'nav.explore': '見つける',
    'nav.library': 'ライブラリ',
    'nav.profile': 'マイページ',
    'nav.search': '音楽を検索',
    'nav.toplist': 'ランキング',
    'nav.settings': '設定',

    'player.play': '再生',
    'player.pause': '一時停止',
    'player.next': '次の曲',
    'player.previous': '前の曲',
    'player.shuffle': 'シャッフル',
    'player.repeat': 'リピート',
    'player.repeatOne': '1曲リピート',
    'player.queue': '再生キュー',
    'player.lyrics': '歌詞',
    'player.volume': '音量',
    'player.quality': '音質',
    'player.playbackRate': '再生速度',
    'player.timer': 'スリープタイマー',

    'song.like': 'いいね',
    'song.unlike': 'いいね解除',
    'song.download': 'ダウンロード',
    'song.addToPlaylist': 'プレイリストに追加',
    'song.playNext': '次に再生',
    'song.addToQueue': 'キューに追加',
    'song.viewArtist': 'アーティストを見る',
    'song.viewAlbum': 'アルバムを見る',
    'song.comment': 'コメント',

    'playlist.create': 'プレイリスト作成',
    'playlist.edit': 'プレイリスト編集',
    'playlist.delete': 'プレイリスト削除',
    'playlist.songs': '{count} 曲',
    'playlist.playAll': 'すべて再生',
    'playlist.shufflePlay': 'シャッフル再生',
    'playlist.subscribe': 'フォロー',
    'playlist.unsubscribe': 'フォロー解除',

    'user.login': 'ログイン',
    'user.register': '登録',
    'user.logout': 'ログアウト',
    'user.profile': 'プロフィール',
    'user.settings': '設定',
    'user.followers': 'フォロワー',
    'user.following': 'フォロー中',
    'user.follow': 'フォロー',
    'user.unfollow': 'フォロー解除',

    'settings.theme': 'テーマ',
    'settings.themeLight': 'ライト',
    'settings.themeDark': 'ダーク',
    'settings.themeSystem': 'システム',
    'settings.language': '言語',
    'settings.quality': '音質設定',
    'settings.download': 'ダウンロード',
    'settings.notification': '通知',
    'settings.privacy': 'プライバシー',
    'settings.about': 'について',
    'settings.feedback': 'フィードバック',

    'message.success': '成功',
    'message.error': 'エラー',
    'message.copied': 'コピーしました',
    'message.saved': '保存しました',
    'message.deleted': '削除しました',
    'message.added': '追加しました',
    'message.removed': '削除しました',
    'message.downloaded': 'ダウンロード完了',
    'message.networkError': 'ネットワークエラー',
    'message.loginRequired': 'ログインしてください',

    'empty.noSongs': '曲がありません',
    'empty.noPlaylists': 'プレイリストがありません',
    'empty.noResults': '検索結果がありません',
    'empty.noHistory': '履歴がありません',
    'empty.noDownloads': 'ダウンロードがありません',
    'empty.noComments': 'コメントがありません',
  },

  'ko-KR': {
    'common.loading': '로딩 중...',
    'common.error': '오류',
    'common.retry': '다시 시도',
    'common.cancel': '취소',
    'common.confirm': '확인',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.edit': '편집',
    'common.share': '공유',
    'common.search': '검색',
    'common.more': '더 보기',
    'common.back': '뒤로',
    'common.next': '다음',
    'common.done': '완료',

    'nav.home': '홈',
    'nav.explore': '둘러보기',
    'nav.library': '보관함',
    'nav.profile': '내 정보',
    'nav.search': '음악 검색',
    'nav.toplist': '차트',
    'nav.settings': '설정',

    'player.play': '재생',
    'player.pause': '일시정지',
    'player.next': '다음 곡',
    'player.previous': '이전 곡',
    'player.shuffle': '셔플',
    'player.repeat': '반복',
    'player.repeatOne': '한 곡 반복',
    'player.queue': '재생 대기열',
    'player.lyrics': '가사',
    'player.volume': '볼륨',
    'player.quality': '음질',
    'player.playbackRate': '재생 속도',
    'player.timer': '슬립 타이머',

    'song.like': '좋아요',
    'song.unlike': '좋아요 취소',
    'song.download': '다운로드',
    'song.addToPlaylist': '플레이리스트에 추가',
    'song.playNext': '다음에 재생',
    'song.addToQueue': '대기열에 추가',
    'song.viewArtist': '아티스트 보기',
    'song.viewAlbum': '앨범 보기',
    'song.comment': '댓글',

    'playlist.create': '플레이리스트 만들기',
    'playlist.edit': '플레이리스트 편집',
    'playlist.delete': '플레이리스트 삭제',
    'playlist.songs': '{count} 곡',
    'playlist.playAll': '전체 재생',
    'playlist.shufflePlay': '셔플 재생',
    'playlist.subscribe': '구독',
    'playlist.unsubscribe': '구독 취소',

    'user.login': '로그인',
    'user.register': '가입',
    'user.logout': '로그아웃',
    'user.profile': '프로필',
    'user.settings': '설정',
    'user.followers': '팔로워',
    'user.following': '팔로잉',
    'user.follow': '팔로우',
    'user.unfollow': '언팔로우',

    'settings.theme': '테마',
    'settings.themeLight': '라이트',
    'settings.themeDark': '다크',
    'settings.themeSystem': '시스템',
    'settings.language': '언어',
    'settings.quality': '음질 설정',
    'settings.download': '다운로드',
    'settings.notification': '알림',
    'settings.privacy': '개인정보',
    'settings.about': '정보',
    'settings.feedback': '피드백',

    'message.success': '성공',
    'message.error': '오류',
    'message.copied': '복사됨',
    'message.saved': '저장됨',
    'message.deleted': '삭제됨',
    'message.added': '추가됨',
    'message.removed': '제거됨',
    'message.downloaded': '다운로드 완료',
    'message.networkError': '네트워크 오류',
    'message.loginRequired': '로그인이 필요합니다',

    'empty.noSongs': '노래가 없습니다',
    'empty.noPlaylists': '플레이리스트가 없습니다',
    'empty.noResults': '검색 결과가 없습니다',
    'empty.noHistory': '재생 기록이 없습니다',
    'empty.noDownloads': '다운로드가 없습니다',
    'empty.noComments': '댓글이 없습니다',
  },
}

// i18n Store
interface I18nStore {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

export const useI18n = create<I18nStore>()(
  persist(
    (set, get) => ({
      locale: 'zh-CN',

      setLocale: (locale) => {
        set({ locale })
        document.documentElement.lang = locale
      },

      t: (key, params) => {
        const { locale } = get()
        const text = translations[locale]?.[key as TranslationKey] ||
                     translations['zh-CN'][key as TranslationKey] ||
                     key

        if (params) {
          return Object.entries(params).reduce(
            (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
            text
          )
        }

        return text
      },
    }),
    {
      name: 'i18n-storage',
    }
  )
)

// 便捷函数
export const t = (key: string, params?: Record<string, string | number>) => {
  return useI18n.getState().t(key, params)
}

export default useI18n
