import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo user
  const passwordHash = await bcrypt.hash('demo123', 10)
  const demoUser = await prisma.user.upsert({
    where: { username: 'demo' },
    update: {},
    create: {
      username: 'demo',
      email: 'demo@example.com',
      passwordHash,
      avatar: 'https://picsum.photos/seed/user1/200',
      bio: '音乐爱好者',
      level: 5,
      exp: 1200,
    },
  })
  console.log('Created demo user:', demoUser.username)

  // Create artists
  const jay = await prisma.artist.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '周杰伦',
      avatar: 'https://picsum.photos/seed/jay/200',
      cover: 'https://picsum.photos/seed/jay-cover/800/400',
      bio: '华语流行音乐天王，创作型歌手、词曲作者、音乐制作人、导演、演员',
      country: '中国台湾',
      genres: ['流行', 'R&B', '中国风'],
      isVerified: true,
      followerCount: 50000000,
    },
  })

  const pepper = await prisma.artist.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: '买辣椒也用券',
      avatar: 'https://picsum.photos/seed/pepper/200',
      cover: 'https://picsum.photos/seed/pepper-cover/800/400',
      bio: '独立音乐人，代表作《起风了》',
      country: '中国',
      genres: ['民谣', '流行'],
      isVerified: true,
      followerCount: 1000000,
    },
  })

  const eason = await prisma.artist.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: '陈奕迅',
      avatar: 'https://picsum.photos/seed/eason/200',
      cover: 'https://picsum.photos/seed/eason-cover/800/400',
      bio: '香港歌神，实力派歌手',
      country: '中国香港',
      genres: ['流行', '粤语'],
      isVerified: true,
      followerCount: 30000000,
    },
  })

  const liushuang = await prisma.artist.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: '柳爽',
      avatar: 'https://picsum.photos/seed/liushuang/200',
      cover: 'https://picsum.photos/seed/liushuang-cover/800/400',
      bio: '新生代唱作人',
      country: '中国',
      genres: ['民谣', '摇滚'],
      isVerified: false,
      followerCount: 500000,
    },
  })

  const jj = await prisma.artist.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: '林俊杰',
      avatar: 'https://picsum.photos/seed/jj/200',
      cover: 'https://picsum.photos/seed/jj-cover/800/400',
      bio: '新加坡华语流行歌手，词曲创作人',
      country: '新加坡',
      genres: ['流行', 'R&B'],
      isVerified: true,
      followerCount: 40000000,
    },
  })

  const mayday = await prisma.artist.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: '五月天',
      avatar: 'https://picsum.photos/seed/mayday/200',
      cover: 'https://picsum.photos/seed/mayday-cover/800/400',
      bio: '华语乐坛最成功的摇滚乐团之一',
      country: '中国台湾',
      genres: ['摇滚', '流行'],
      isVerified: true,
      followerCount: 35000000,
    },
  })

  const wangyuan = await prisma.artist.upsert({
    where: { id: 7 },
    update: {},
    create: {
      name: '汪苏泷',
      avatar: 'https://picsum.photos/seed/wangsulang/200',
      cover: 'https://picsum.photos/seed/wangsulang-cover/800/400',
      bio: '流行歌手、音乐制作人',
      country: '中国',
      genres: ['流行', '电子'],
      isVerified: true,
      followerCount: 15000000,
    },
  })

  const xuwei = await prisma.artist.upsert({
    where: { id: 8 },
    update: {},
    create: {
      name: '许巍',
      avatar: 'https://picsum.photos/seed/xuwei/200',
      cover: 'https://picsum.photos/seed/xuwei-cover/800/400',
      bio: '中国摇滚乐灵魂人物',
      country: '中国',
      genres: ['摇滚', '民谣'],
      isVerified: true,
      followerCount: 20000000,
    },
  })

  const artists = [jay, pepper, eason, liushuang, jj, mayday, wangyuan, xuwei]
  console.log('Created artists:', artists.map(a => a.name).join(', '))

  // Create albums
  const album1 = await prisma.album.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '叶惠美',
      artistId: jay.id,
      cover: 'https://picsum.photos/seed/album1/300',
      releaseDate: new Date('2003-07-31'),
      description: '周杰伦第四张专辑，收录《晴天》《以父之名》等经典曲目',
      genre: '流行',
      type: 'album',
    },
  })

  const album2 = await prisma.album.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: '魔杰座',
      artistId: jay.id,
      cover: 'https://picsum.photos/seed/album2/300',
      releaseDate: new Date('2008-10-15'),
      description: '周杰伦第九张专辑，收录《稻香》《给我一首歌的时间》等',
      genre: '流行',
      type: 'album',
    },
  })

  const album3 = await prisma.album.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: '起风了',
      artistId: pepper.id,
      cover: 'https://picsum.photos/seed/album3/300',
      releaseDate: new Date('2017-03-07'),
      description: '买辣椒也用券代表作',
      genre: '流行',
      type: 'single',
    },
  })

  const album4 = await prisma.album.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: '孤勇者',
      artistId: eason.id,
      cover: 'https://picsum.photos/seed/album4/300',
      releaseDate: new Date('2021-11-08'),
      description: '英雄联盟动画剧集《双城之战》主题曲',
      genre: '流行',
      type: 'single',
    },
  })

  const album5 = await prisma.album.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: '第二天堂',
      artistId: jj.id,
      cover: 'https://picsum.photos/seed/album5/300',
      releaseDate: new Date('2004-06-04'),
      description: '林俊杰第二张专辑',
      genre: '流行',
      type: 'album',
    },
  })

  const album6 = await prisma.album.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: '自传',
      artistId: mayday.id,
      cover: 'https://picsum.photos/seed/album6/300',
      releaseDate: new Date('2016-07-21'),
      description: '五月天第九张专辑',
      genre: '摇滚',
      type: 'album',
    },
  })

  const album7 = await prisma.album.upsert({
    where: { id: 7 },
    update: {},
    create: {
      name: '范特西',
      artistId: jay.id,
      cover: 'https://picsum.photos/seed/album7/300',
      releaseDate: new Date('2001-09-14'),
      description: '周杰伦第二张专辑，华语乐坛里程碑',
      genre: '流行',
      type: 'album',
    },
  })

  const album8 = await prisma.album.upsert({
    where: { id: 8 },
    update: {},
    create: {
      name: '蓝莲花',
      artistId: xuwei.id,
      cover: 'https://picsum.photos/seed/album8/300',
      releaseDate: new Date('2002-09-01'),
      description: '许巍经典专辑',
      genre: '摇滚',
      type: 'album',
    },
  })

  const albums = [album1, album2, album3, album4, album5, album6, album7, album8]
  console.log('Created albums:', albums.map(a => a.name).join(', '))

  // SoundHelix demo audio URLs
  const audioUrls = Array.from({ length: 17 }, (_, i) =>
    `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`
  )

  // Create songs - 周杰伦
  const song1 = await prisma.song.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '晴天',
      artistId: jay.id,
      albumId: album1.id,
      duration: 269,
      fileUrl128: audioUrls[0],
      fileUrl320: audioUrls[0],
      cover: 'https://picsum.photos/seed/song1/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2003-07-31'),
      playCount: 100000000,
      likeCount: 5000000,
      isVip: false,
    },
  })

  const song2 = await prisma.song.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: '以父之名',
      artistId: jay.id,
      albumId: album1.id,
      duration: 341,
      fileUrl128: audioUrls[1],
      fileUrl320: audioUrls[1],
      cover: 'https://picsum.photos/seed/song2/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2003-07-31'),
      playCount: 80000000,
      likeCount: 4000000,
      isVip: false,
    },
  })

  const song3 = await prisma.song.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: '稻香',
      artistId: jay.id,
      albumId: album2.id,
      duration: 223,
      fileUrl128: audioUrls[2],
      fileUrl320: audioUrls[2],
      cover: 'https://picsum.photos/seed/song3/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2008-10-15'),
      playCount: 90000000,
      likeCount: 4500000,
      isVip: false,
    },
  })

  const song4 = await prisma.song.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: '给我一首歌的时间',
      artistId: jay.id,
      albumId: album2.id,
      duration: 255,
      fileUrl128: audioUrls[3],
      fileUrl320: audioUrls[3],
      cover: 'https://picsum.photos/seed/song4/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2008-10-15'),
      playCount: 60000000,
      likeCount: 3000000,
      isVip: false,
    },
  })

  const song5 = await prisma.song.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: '双截棍',
      artistId: jay.id,
      albumId: album7.id,
      duration: 193,
      fileUrl128: audioUrls[4],
      fileUrl320: audioUrls[4],
      cover: 'https://picsum.photos/seed/song5/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2001-09-14'),
      playCount: 70000000,
      likeCount: 3500000,
      isVip: false,
    },
  })

  const song6 = await prisma.song.upsert({
    where: { id: 6 },
    update: {},
    create: {
      name: '简单爱',
      artistId: jay.id,
      albumId: album7.id,
      duration: 270,
      fileUrl128: audioUrls[5],
      fileUrl320: audioUrls[5],
      cover: 'https://picsum.photos/seed/song6/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2001-09-14'),
      playCount: 85000000,
      likeCount: 4200000,
      isVip: false,
    },
  })

  // 买辣椒也用券
  const song7 = await prisma.song.upsert({
    where: { id: 7 },
    update: {},
    create: {
      name: '起风了',
      artistId: pepper.id,
      albumId: album3.id,
      duration: 325,
      fileUrl128: audioUrls[6],
      fileUrl320: audioUrls[6],
      cover: 'https://picsum.photos/seed/song7/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2017-03-07'),
      playCount: 80000000,
      likeCount: 4000000,
      isVip: false,
    },
  })

  // 陈奕迅
  const song8 = await prisma.song.upsert({
    where: { id: 8 },
    update: {},
    create: {
      name: '孤勇者',
      artistId: eason.id,
      albumId: album4.id,
      duration: 262,
      fileUrl128: audioUrls[7],
      fileUrl320: audioUrls[7],
      cover: 'https://picsum.photos/seed/song8/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2021-11-08'),
      playCount: 200000000,
      likeCount: 8000000,
      isVip: false,
    },
  })

  const song9 = await prisma.song.upsert({
    where: { id: 9 },
    update: {},
    create: {
      name: '十年',
      artistId: eason.id,
      albumId: null,
      duration: 204,
      fileUrl128: audioUrls[8],
      fileUrl320: audioUrls[8],
      cover: 'https://picsum.photos/seed/song9/300',
      genre: '流行',
      language: '粤语',
      releaseDate: new Date('2003-04-15'),
      playCount: 120000000,
      likeCount: 6000000,
      isVip: false,
    },
  })

  const song10 = await prisma.song.upsert({
    where: { id: 10 },
    update: {},
    create: {
      name: '浮夸',
      artistId: eason.id,
      albumId: null,
      duration: 294,
      fileUrl128: audioUrls[9],
      fileUrl320: audioUrls[9],
      cover: 'https://picsum.photos/seed/song10/300',
      genre: '流行',
      language: '粤语',
      releaseDate: new Date('2005-06-07'),
      playCount: 95000000,
      likeCount: 4800000,
      isVip: false,
    },
  })

  // 柳爽
  const song11 = await prisma.song.upsert({
    where: { id: 11 },
    update: {},
    create: {
      name: '漠河舞厅',
      artistId: liushuang.id,
      albumId: null,
      duration: 292,
      fileUrl128: audioUrls[10],
      fileUrl320: audioUrls[10],
      cover: 'https://picsum.photos/seed/song11/300',
      genre: '民谣',
      language: '国语',
      releaseDate: new Date('2020-12-01'),
      playCount: 50000000,
      likeCount: 2500000,
      isVip: false,
    },
  })

  // 林俊杰
  const song12 = await prisma.song.upsert({
    where: { id: 12 },
    update: {},
    create: {
      name: '江南',
      artistId: jj.id,
      albumId: album5.id,
      duration: 290,
      fileUrl128: audioUrls[11],
      fileUrl320: audioUrls[11],
      cover: 'https://picsum.photos/seed/song12/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2004-06-04'),
      playCount: 110000000,
      likeCount: 5500000,
      isVip: false,
    },
  })

  const song13 = await prisma.song.upsert({
    where: { id: 13 },
    update: {},
    create: {
      name: '可惜没如果',
      artistId: jj.id,
      albumId: null,
      duration: 298,
      fileUrl128: audioUrls[12],
      fileUrl320: audioUrls[12],
      cover: 'https://picsum.photos/seed/song13/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2014-12-27'),
      playCount: 75000000,
      likeCount: 3700000,
      isVip: false,
    },
  })

  // 五月天
  const song14 = await prisma.song.upsert({
    where: { id: 14 },
    update: {},
    create: {
      name: '倔强',
      artistId: mayday.id,
      albumId: null,
      duration: 281,
      fileUrl128: audioUrls[13],
      fileUrl320: audioUrls[13],
      cover: 'https://picsum.photos/seed/song14/300',
      genre: '摇滚',
      language: '国语',
      releaseDate: new Date('2004-11-05'),
      playCount: 65000000,
      likeCount: 3200000,
      isVip: false,
    },
  })

  const song15 = await prisma.song.upsert({
    where: { id: 15 },
    update: {},
    create: {
      name: '成全',
      artistId: mayday.id,
      albumId: album6.id,
      duration: 305,
      fileUrl128: audioUrls[14],
      fileUrl320: audioUrls[14],
      cover: 'https://picsum.photos/seed/song15/300',
      genre: '摇滚',
      language: '国语',
      releaseDate: new Date('2016-07-21'),
      playCount: 55000000,
      likeCount: 2800000,
      isVip: false,
    },
  })

  // 汪苏泷
  const song16 = await prisma.song.upsert({
    where: { id: 16 },
    update: {},
    create: {
      name: '有点甜',
      artistId: wangyuan.id,
      albumId: null,
      duration: 245,
      fileUrl128: audioUrls[15],
      fileUrl320: audioUrls[15],
      cover: 'https://picsum.photos/seed/song16/300',
      genre: '流行',
      language: '国语',
      releaseDate: new Date('2016-03-01'),
      playCount: 45000000,
      likeCount: 2200000,
      isVip: false,
    },
  })

  // 许巍
  const song17 = await prisma.song.upsert({
    where: { id: 17 },
    update: {},
    create: {
      name: '蓝莲花',
      artistId: xuwei.id,
      albumId: album8.id,
      duration: 249,
      fileUrl128: audioUrls[16],
      fileUrl320: audioUrls[16],
      cover: 'https://picsum.photos/seed/song17/300',
      genre: '摇滚',
      language: '国语',
      releaseDate: new Date('2002-09-01'),
      playCount: 88000000,
      likeCount: 4400000,
      isVip: false,
    },
  })

  const songs = [song1, song2, song3, song4, song5, song6, song7, song8, song9, song10, song11, song12, song13, song14, song15, song16, song17]
  console.log('Created songs:', songs.map(s => s.name).join(', '))

  // Create lyrics for demo songs
  await prisma.lyrics.upsert({
    where: { id: 1 },
    update: {},
    create: {
      songId: song1.id,
      content: `[00:00.00]晴天 - 周杰伦
[00:03.50]词：周杰伦
[00:05.00]曲：周杰伦
[00:28.50]故事的小黄花
[00:31.50]从出生那年就飘着
[00:35.00]童年的荡秋千
[00:38.00]随记忆一直晃到现在
[00:42.00]Re So So Si Do Si La
[00:45.50]So La Si Si Si Si La Si La So
[00:49.50]吹着前奏望着天空
[00:52.50]我想起花瓣试着掉落
[00:56.00]为你翘课的那一天
[00:59.50]花落的那一天
[01:02.50]教室的那一间
[01:05.50]我怎么看不见
[01:08.50]消失的下雨天
[01:12.00]我好想再淋一遍`,
      type: 'lrc',
      language: '国语',
    },
  })

  await prisma.lyrics.upsert({
    where: { id: 2 },
    update: {},
    create: {
      songId: song3.id,
      content: `[00:00.00]稻香 - 周杰伦
[00:03.50]词：周杰伦
[00:05.00]曲：周杰伦
[00:17.00]对这个世界如果你有太多的抱怨
[00:20.50]跌倒了就不敢继续往前走
[00:24.00]为什么人要这么的脆弱堕落
[00:28.00]请你打开电视看看
[00:31.00]多少人为生命在努力勇敢的走下去
[00:34.50]我们是不是该知足
[00:37.50]珍惜一切就算没有拥有`,
      type: 'lrc',
      language: '国语',
    },
  })

  await prisma.lyrics.upsert({
    where: { id: 3 },
    update: {},
    create: {
      songId: song7.id,
      content: `[00:00.00]起风了 - 买辣椒也用券
[00:15.00]这一路上走走停停
[00:19.00]顺着少年漂流的痕迹
[00:23.00]迈出车站的前一刻
[00:27.00]竟有些犹豫
[00:31.00]不禁笑这近乡情怯
[00:35.00]仍无可避免
[00:39.00]而长野的天
[00:43.00]依旧那么暖
[00:47.00]风吹起了从前`,
      type: 'lrc',
      language: '国语',
    },
  })

  await prisma.lyrics.upsert({
    where: { id: 4 },
    update: {},
    create: {
      songId: song8.id,
      content: `[00:00.00]孤勇者 - 陈奕迅
[00:12.00]都是勇敢的
[00:16.00]你额头的伤口 你的不同 你犯的错
[00:23.00]都不必隐藏
[00:27.00]你破旧的玩偶 你的面具 你的自我
[00:35.00]他们说 要带着光 驯服每一头怪兽
[00:42.00]他们说 要缝好你的伤 没有人爱小丑
[00:49.00]为何孤独不可光荣
[00:52.00]人只有不完美
[00:55.00]值得歌颂
[00:57.00]谁说污泥满身的不算英雄`,
      type: 'lrc',
      language: '国语',
    },
  })

  await prisma.lyrics.upsert({
    where: { id: 5 },
    update: {},
    create: {
      songId: song12.id,
      content: `[00:00.00]江南 - 林俊杰
[00:20.00]风到这里就是粘
[00:24.00]粘住过客的思念
[00:28.00]雨到了这里缠成线
[00:32.00]缠着我们留恋人世间
[00:36.00]你在身边就是缘
[00:40.00]缘分写在三生石上面
[00:44.00]爱有万分之一甜
[00:48.00]宁愿我就葬在这一天`,
      type: 'lrc',
      language: '国语',
    },
  })

  // Create playlists
  const playlist1 = await prisma.playlist.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: '华语经典金曲',
      userId: demoUser.id,
      cover: 'https://picsum.photos/seed/playlist1/300',
      description: '精选华语流行经典歌曲，带你重温那些年的感动',
      tags: ['华语', '经典', '流行'],
      isPublic: true,
      isOfficial: true,
      playCount: 1000000,
      likeCount: 50000,
      songCount: 10,
    },
  })

  const playlist2 = await prisma.playlist.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: '周杰伦精选',
      userId: demoUser.id,
      cover: 'https://picsum.photos/seed/playlist2/300',
      description: '周董经典歌曲合集',
      tags: ['周杰伦', '流行', '经典'],
      isPublic: true,
      isOfficial: true,
      playCount: 2000000,
      likeCount: 80000,
      songCount: 6,
    },
  })

  const playlist3 = await prisma.playlist.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: '民谣时光',
      userId: demoUser.id,
      cover: 'https://picsum.photos/seed/playlist3/300',
      description: '安静的民谣，陪你度过午后时光',
      tags: ['民谣', '轻音乐', '治愈'],
      isPublic: true,
      isOfficial: false,
      playCount: 500000,
      likeCount: 25000,
      songCount: 3,
    },
  })

  const playlist4 = await prisma.playlist.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: '热门歌曲榜',
      userId: demoUser.id,
      cover: 'https://picsum.photos/seed/playlist4/300',
      description: '实时更新的热门歌曲排行榜',
      tags: ['热门', '排行榜', '流行'],
      isPublic: true,
      isOfficial: true,
      playCount: 5000000,
      likeCount: 200000,
      songCount: 17,
    },
  })

  console.log('Created playlists')

  // Add songs to playlists
  // 华语经典金曲
  const classicSongs = [song1, song3, song7, song8, song9, song12, song14, song17]
  for (let i = 0; i < classicSongs.length; i++) {
    await prisma.playlistSong.upsert({
      where: {
        playlistId_songId: {
          playlistId: playlist1.id,
          songId: classicSongs[i].id,
        },
      },
      update: {},
      create: {
        playlistId: playlist1.id,
        songId: classicSongs[i].id,
        sortOrder: i,
      },
    })
  }

  // 周杰伦精选
  const jaySongs = [song1, song2, song3, song4, song5, song6]
  for (let i = 0; i < jaySongs.length; i++) {
    await prisma.playlistSong.upsert({
      where: {
        playlistId_songId: {
          playlistId: playlist2.id,
          songId: jaySongs[i].id,
        },
      },
      update: {},
      create: {
        playlistId: playlist2.id,
        songId: jaySongs[i].id,
        sortOrder: i,
      },
    })
  }

  // 民谣时光
  const folkSongs = [song7, song11, song17]
  for (let i = 0; i < folkSongs.length; i++) {
    await prisma.playlistSong.upsert({
      where: {
        playlistId_songId: {
          playlistId: playlist3.id,
          songId: folkSongs[i].id,
        },
      },
      update: {},
      create: {
        playlistId: playlist3.id,
        songId: folkSongs[i].id,
        sortOrder: i,
      },
    })
  }

  // 热门歌曲榜
  for (let i = 0; i < songs.length; i++) {
    await prisma.playlistSong.upsert({
      where: {
        playlistId_songId: {
          playlistId: playlist4.id,
          songId: songs[i].id,
        },
      },
      update: {},
      create: {
        playlistId: playlist4.id,
        songId: songs[i].id,
        sortOrder: i,
      },
    })
  }

  console.log('Added songs to playlists')
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
