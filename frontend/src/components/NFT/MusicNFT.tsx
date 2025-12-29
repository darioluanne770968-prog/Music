import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 音乐NFT组件
 * 音乐NFT铸造、收藏、交易
 */

// NFT 稀有度
type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

// 音乐 NFT
interface MusicNFT {
  id: string
  tokenId: string
  title: string
  artist: string
  artwork: string
  audioPreview: string
  rarity: Rarity
  edition: { current: number; total: number }
  price: number
  currency: 'ETH' | 'SOL' | 'MATIC'
  owner: string
  creator: string
  royalty: number
  attributes: { trait: string; value: string }[]
  likes: number
  plays: number
  createdAt: Date
  isListed: boolean
}

// 收藏集
interface NFTCollection {
  id: string
  name: string
  artist: string
  avatar: string
  coverImage: string
  description: string
  items: number
  floorPrice: number
  totalVolume: number
  verified: boolean
}

// 交易记录
interface Transaction {
  id: string
  type: 'mint' | 'sale' | 'transfer' | 'list'
  nftId: string
  from: string
  to: string
  price?: number
  timestamp: Date
  txHash: string
}

// 稀有度配置
const RARITY_CONFIG: Record<Rarity, { name: string; color: string; gradient: string }> = {
  common: { name: '普通', color: '#9ca3af', gradient: 'from-gray-400 to-gray-500' },
  rare: { name: '稀有', color: '#3b82f6', gradient: 'from-blue-400 to-blue-600' },
  epic: { name: '史诗', color: '#8b5cf6', gradient: 'from-purple-400 to-purple-600' },
  legendary: { name: '传说', color: '#f59e0b', gradient: 'from-yellow-400 to-orange-500' },
  mythic: { name: '神话', color: '#ef4444', gradient: 'from-red-400 to-pink-500' }
}

// NFT Hook
export function useMusicNFT() {
  const [myNFTs, setMyNFTs] = useState<MusicNFT[]>([])
  const [marketplace, setMarketplace] = useState<MusicNFT[]>([])
  const [collections, setCollections] = useState<NFTCollection[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // 模拟数据
  useState(() => {
    const mockNFTs: MusicNFT[] = [
      {
        id: 'nft1',
        tokenId: '0x1234...5678',
        title: '晴天 - 限定版',
        artist: '周杰伦',
        artwork: '/api/placeholder/400/400',
        audioPreview: '/api/placeholder/audio',
        rarity: 'legendary',
        edition: { current: 1, total: 100 },
        price: 2.5,
        currency: 'ETH',
        owner: '0xabcd...efgh',
        creator: '0xijkl...mnop',
        royalty: 10,
        attributes: [
          { trait: '专辑', value: '叶惠美' },
          { trait: '年份', value: '2003' },
          { trait: '流派', value: '流行' }
        ],
        likes: 1250,
        plays: 8500,
        createdAt: new Date('2024-01-15'),
        isListed: true
      },
      {
        id: 'nft2',
        tokenId: '0x2345...6789',
        title: '青花瓷 - 珍藏版',
        artist: '周杰伦',
        artwork: '/api/placeholder/400/400',
        audioPreview: '/api/placeholder/audio',
        rarity: 'mythic',
        edition: { current: 1, total: 10 },
        price: 15,
        currency: 'ETH',
        owner: '0xqrst...uvwx',
        creator: '0xijkl...mnop',
        royalty: 15,
        attributes: [
          { trait: '专辑', value: '我很忙' },
          { trait: '年份', value: '2007' },
          { trait: '流派', value: '中国风' }
        ],
        likes: 3200,
        plays: 15000,
        createdAt: new Date('2024-02-20'),
        isListed: true
      },
      {
        id: 'nft3',
        tokenId: '0x3456...789a',
        title: '七里香 - 纪念版',
        artist: '周杰伦',
        artwork: '/api/placeholder/400/400',
        audioPreview: '/api/placeholder/audio',
        rarity: 'epic',
        edition: { current: 25, total: 500 },
        price: 0.8,
        currency: 'ETH',
        owner: '0xyzab...cdef',
        creator: '0xijkl...mnop',
        royalty: 10,
        attributes: [
          { trait: '专辑', value: '七里香' },
          { trait: '年份', value: '2004' },
          { trait: '流派', value: '流行' }
        ],
        likes: 890,
        plays: 5600,
        createdAt: new Date('2024-03-10'),
        isListed: true
      }
    ]

    const mockCollections: NFTCollection[] = [
      {
        id: 'col1',
        name: '周杰伦经典系列',
        artist: '周杰伦',
        avatar: '🎤',
        coverImage: '/api/placeholder/600/200',
        description: '周杰伦历年经典歌曲NFT收藏集',
        items: 50,
        floorPrice: 0.5,
        totalVolume: 125.5,
        verified: true
      },
      {
        id: 'col2',
        name: '华语金曲收藏',
        artist: '群星',
        avatar: '🎵',
        coverImage: '/api/placeholder/600/200',
        description: '华语乐坛经典金曲数字收藏',
        items: 200,
        floorPrice: 0.2,
        totalVolume: 85.2,
        verified: true
      }
    ]

    setMarketplace(mockNFTs)
    setCollections(mockCollections)
  })

  // 连接钱包
  const connectWallet = useCallback(async () => {
    // 模拟钱包连接
    await new Promise(resolve => setTimeout(resolve, 1000))
    setWalletConnected(true)
    setWalletAddress('0x1234...5678')
  }, [])

  // 断开钱包
  const disconnectWallet = useCallback(() => {
    setWalletConnected(false)
    setWalletAddress(null)
  }, [])

  // 购买 NFT
  const buyNFT = useCallback(async (nftId: string) => {
    const nft = marketplace.find(n => n.id === nftId)
    if (!nft || !walletConnected) return false

    // 模拟购买
    await new Promise(resolve => setTimeout(resolve, 2000))

    setMyNFTs(prev => [...prev, { ...nft, owner: walletAddress! }])
    setMarketplace(prev => prev.filter(n => n.id !== nftId))

    setTransactions(prev => [...prev, {
      id: `tx_${Date.now()}`,
      type: 'sale',
      nftId,
      from: nft.owner,
      to: walletAddress!,
      price: nft.price,
      timestamp: new Date(),
      txHash: `0x${Math.random().toString(16).slice(2)}`
    }])

    return true
  }, [marketplace, walletConnected, walletAddress])

  // 铸造 NFT
  const mintNFT = useCallback(async (data: {
    title: string
    artwork: string
    audio: string
    rarity: Rarity
    editions: number
    price: number
    royalty: number
  }) => {
    if (!walletConnected) return null

    await new Promise(resolve => setTimeout(resolve, 3000))

    const newNFT: MusicNFT = {
      id: `nft_${Date.now()}`,
      tokenId: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      title: data.title,
      artist: '我',
      artwork: data.artwork,
      audioPreview: data.audio,
      rarity: data.rarity,
      edition: { current: 1, total: data.editions },
      price: data.price,
      currency: 'ETH',
      owner: walletAddress!,
      creator: walletAddress!,
      royalty: data.royalty,
      attributes: [],
      likes: 0,
      plays: 0,
      createdAt: new Date(),
      isListed: false
    }

    setMyNFTs(prev => [...prev, newNFT])

    return newNFT
  }, [walletConnected, walletAddress])

  // 上架 NFT
  const listNFT = useCallback(async (nftId: string, price: number) => {
    setMyNFTs(prev => prev.map(nft =>
      nft.id === nftId ? { ...nft, price, isListed: true } : nft
    ))

    const nft = myNFTs.find(n => n.id === nftId)
    if (nft) {
      setMarketplace(prev => [...prev, { ...nft, price, isListed: true }])
    }
  }, [myNFTs])

  return {
    myNFTs,
    marketplace,
    collections,
    transactions,
    walletConnected,
    walletAddress,
    connectWallet,
    disconnectWallet,
    buyNFT,
    mintNFT,
    listNFT
  }
}

// NFT 卡片
const NFTCard: React.FC<{
  nft: MusicNFT
  onClick: () => void
}> = ({ nft, onClick }) => {
  const rarityConfig = RARITY_CONFIG[nft.rarity]

  return (
    <motion.div
      className="bg-dark-800 rounded-xl overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
    >
      {/* 封面 */}
      <div className="relative aspect-square">
        <img
          src={nft.artwork}
          alt={nft.title}
          className="w-full h-full object-cover"
        />

        {/* 稀有度标签 */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium
                       bg-gradient-to-r ${rarityConfig.gradient} text-white`}>
          {rarityConfig.name}
        </div>

        {/* 版本号 */}
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 rounded-full text-xs text-white">
          #{nft.edition.current}/{nft.edition.total}
        </div>

        {/* 播放按钮 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100
                      bg-black/30 transition-opacity">
          <motion.div
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm
                     flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-2xl">▶️</span>
          </motion.div>
        </div>
      </div>

      {/* 信息 */}
      <div className="p-4">
        <h4 className="text-white font-medium truncate">{nft.title}</h4>
        <p className="text-sm text-white/60">{nft.artist}</p>

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-xs text-white/40">价格</p>
            <p className="text-lg font-bold text-white">
              {nft.price} {nft.currency}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/40">
            <span>❤️ {nft.likes}</span>
            <span>▶️ {nft.plays}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 收藏集卡片
const CollectionCard: React.FC<{
  collection: NFTCollection
  onClick: () => void
}> = ({ collection, onClick }) => {
  return (
    <motion.div
      className="bg-dark-800 rounded-xl overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="relative h-24">
        <img
          src={collection.coverImage}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="text-3xl">{collection.avatar}</span>
          <div>
            <div className="flex items-center gap-1">
              <h4 className="text-white font-medium">{collection.name}</h4>
              {collection.verified && (
                <span className="text-primary-400">✓</span>
              )}
            </div>
            <p className="text-xs text-white/60">{collection.artist}</p>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-white font-medium">{collection.items}</p>
          <p className="text-xs text-white/40">作品</p>
        </div>
        <div>
          <p className="text-white font-medium">{collection.floorPrice} ETH</p>
          <p className="text-xs text-white/40">地板价</p>
        </div>
        <div>
          <p className="text-white font-medium">{collection.totalVolume} ETH</p>
          <p className="text-xs text-white/40">总交易量</p>
        </div>
      </div>
    </motion.div>
  )
}

// NFT 详情弹窗
const NFTDetailModal: React.FC<{
  nft: MusicNFT
  onClose: () => void
  onBuy: () => void
  walletConnected: boolean
}> = ({ nft, onClose, onBuy, walletConnected }) => {
  const rarityConfig = RARITY_CONFIG[nft.rarity]
  const [isBuying, setIsBuying] = useState(false)

  const handleBuy = async () => {
    setIsBuying(true)
    await onBuy()
    setIsBuying(false)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-dark-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* 左侧 - 封面 */}
          <div>
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img
                src={nft.artwork}
                alt={nft.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium
                             bg-gradient-to-r ${rarityConfig.gradient} text-white`}>
                {rarityConfig.name}
              </div>
            </div>
          </div>

          {/* 右侧 - 信息 */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{nft.title}</h2>
              <p className="text-white/60">{nft.artist}</p>
            </div>

            {/* 版本信息 */}
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white/60">版本</span>
                <span className="text-white">#{nft.edition.current} / {nft.edition.total}</span>
              </div>
            </div>

            {/* 属性 */}
            <div>
              <p className="text-white/60 text-sm mb-2">属性</p>
              <div className="flex flex-wrap gap-2">
                {nft.attributes.map((attr, i) => (
                  <div key={i} className="px-3 py-2 bg-primary-500/20 rounded-lg">
                    <p className="text-xs text-white/40">{attr.trait}</p>
                    <p className="text-sm text-white">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 价格 */}
            <div className="p-4 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-xl">
              <p className="text-white/60 text-sm">当前价格</p>
              <p className="text-3xl font-bold text-white">
                {nft.price} {nft.currency}
              </p>
              <p className="text-sm text-white/40">
                ≈ ${(nft.price * 2000).toLocaleString()} USD
              </p>
            </div>

            {/* 版税信息 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/40">创作者版税</span>
              <span className="text-white">{nft.royalty}%</span>
            </div>

            {/* 购买按钮 */}
            <button
              onClick={handleBuy}
              disabled={!walletConnected || isBuying}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl
                       text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {!walletConnected ? (
                '请先连接钱包'
              ) : isBuying ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  购买中...
                </>
              ) : (
                <>立即购买</>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 铸造表单
const MintForm: React.FC<{
  onMint: (data: any) => Promise<MusicNFT | null>
  onClose: () => void
}> = ({ onMint, onClose }) => {
  const [title, setTitle] = useState('')
  const [rarity, setRarity] = useState<Rarity>('rare')
  const [editions, setEditions] = useState(100)
  const [price, setPrice] = useState(0.1)
  const [royalty, setRoyalty] = useState(10)
  const [isMinting, setIsMinting] = useState(false)

  const handleMint = async () => {
    setIsMinting(true)
    await onMint({
      title,
      artwork: '/api/placeholder/400/400',
      audio: '/api/placeholder/audio',
      rarity,
      editions,
      price,
      royalty
    })
    setIsMinting(false)
    onClose()
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">铸造音乐 NFT</h3>

      <div>
        <label className="text-sm text-white/60 block mb-2">作品名称</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入作品名称"
          className="w-full bg-white/10 rounded-lg px-4 py-3 text-white
                   placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label className="text-sm text-white/60 block mb-2">稀有度</label>
        <div className="flex gap-2">
          {(Object.entries(RARITY_CONFIG) as [Rarity, typeof RARITY_CONFIG[Rarity]][]).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setRarity(key)}
              className={`flex-1 py-2 rounded-lg text-sm ${
                rarity === key
                  ? `bg-gradient-to-r ${config.gradient} text-white`
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-white/60 block mb-2">发行量</label>
          <input
            type="number"
            value={editions}
            onChange={(e) => setEditions(parseInt(e.target.value))}
            className="w-full bg-white/10 rounded-lg px-4 py-3 text-white
                     focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="text-sm text-white/60 block mb-2">价格 (ETH)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="w-full bg-white/10 rounded-lg px-4 py-3 text-white
                     focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-white/60 block mb-2">版税 ({royalty}%)</label>
        <input
          type="range"
          min="0"
          max="25"
          value={royalty}
          onChange={(e) => setRoyalty(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={handleMint}
        disabled={!title || isMinting}
        className="w-full py-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl
                 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isMinting ? (
          <>
            <motion.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            铸造中...
          </>
        ) : (
          '铸造 NFT'
        )}
      </button>
    </div>
  )
}

// 主界面
interface MusicNFTProps {
  className?: string
}

export const MusicNFT: React.FC<MusicNFTProps> = ({ className }) => {
  const {
    myNFTs,
    marketplace,
    collections,
    walletConnected,
    walletAddress,
    connectWallet,
    buyNFT,
    mintNFT
  } = useMusicNFT()

  const [activeTab, setActiveTab] = useState<'marketplace' | 'collections' | 'my_nfts' | 'mint'>('marketplace')
  const [selectedNFT, setSelectedNFT] = useState<MusicNFT | null>(null)

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">音乐 NFT</h3>
          <p className="text-sm text-white/40">数字音乐收藏品</p>
        </div>

        {walletConnected ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-green-400 text-sm">{walletAddress}</span>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-primary-500 rounded-lg text-white text-sm"
          >
            连接钱包
          </button>
        )}
      </div>

      {/* 标签页 */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { key: 'marketplace', label: '市场' },
          { key: 'collections', label: '收藏集' },
          { key: 'my_nfts', label: '我的NFT' },
          { key: 'mint', label: '铸造' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-white/10 text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'marketplace' && (
          <motion.div
            key="marketplace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-4"
          >
            {marketplace.map(nft => (
              <NFTCard
                key={nft.id}
                nft={nft}
                onClick={() => setSelectedNFT(nft)}
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'collections' && (
          <motion.div
            key="collections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {collections.map(collection => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => {}}
              />
            ))}
          </motion.div>
        )}

        {activeTab === 'my_nfts' && (
          <motion.div
            key="my_nfts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {myNFTs.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {myNFTs.map(nft => (
                  <NFTCard key={nft.id} nft={nft} onClick={() => setSelectedNFT(nft)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl block mb-4">🖼️</span>
                <p className="text-white/60">暂无 NFT</p>
                <p className="text-white/40 text-sm">去市场购买或铸造你的第一个 NFT</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'mint' && (
          <motion.div
            key="mint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {walletConnected ? (
              <MintForm onMint={mintNFT} onClose={() => setActiveTab('my_nfts')} />
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl block mb-4">🔗</span>
                <p className="text-white/60 mb-4">请先连接钱包</p>
                <button
                  onClick={connectWallet}
                  className="px-6 py-2 bg-primary-500 rounded-lg text-white"
                >
                  连接钱包
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* NFT 详情弹窗 */}
      <AnimatePresence>
        {selectedNFT && (
          <NFTDetailModal
            nft={selectedNFT}
            onClose={() => setSelectedNFT(null)}
            onBuy={() => buyNFT(selectedNFT.id)}
            walletConnected={walletConnected}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default MusicNFT
