import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * 票务商城组件
 * 演唱会、音乐节门票购买
 */

// 演出类型
type EventType = 'concert' | 'festival' | 'liveshow' | 'fanmeeting'

// 演出信息
interface MusicEvent {
  id: string
  title: string
  artist: string
  artistAvatar: string
  type: EventType
  coverImage: string
  venue: string
  city: string
  date: Date
  tickets: TicketTier[]
  status: 'upcoming' | 'onsale' | 'soldout' | 'ended'
  isHot: boolean
  tags: string[]
}

// 票档
interface TicketTier {
  id: string
  name: string
  price: number
  originalPrice?: number
  available: number
  total: number
  description: string
  perks: string[]
}

// 订单
interface Order {
  id: string
  eventId: string
  eventTitle: string
  ticketTier: string
  quantity: number
  totalPrice: number
  status: 'pending' | 'paid' | 'confirmed' | 'used' | 'refunded'
  createdAt: Date
  qrCode?: string
}

// 票务商城 Hook
export function useTicketStore() {
  const [events, setEvents] = useState<MusicEvent[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedEvent, setSelectedEvent] = useState<MusicEvent | null>(null)
  const [cart, setCart] = useState<{ eventId: string; tierId: string; quantity: number }[]>([])

  // 模拟演出数据
  useState(() => {
    const mockEvents: MusicEvent[] = [
      {
        id: '1',
        title: '2024 世界巡回演唱会',
        artist: '周杰伦',
        artistAvatar: '/api/placeholder/50/50',
        type: 'concert',
        coverImage: '/api/placeholder/400/200',
        venue: '国家体育场（鸟巢）',
        city: '北京',
        date: new Date('2024-08-15'),
        tickets: [
          { id: 't1', name: 'VIP区', price: 2580, originalPrice: 2880, available: 50, total: 500, description: '最佳视野', perks: ['专属通道', '限定周边', '签名照'] },
          { id: 't2', name: '内场A区', price: 1880, available: 200, total: 2000, description: '近距离观看', perks: ['专属通道'] },
          { id: 't3', name: '内场B区', price: 1280, available: 500, total: 3000, description: '标准内场', perks: [] },
          { id: 't4', name: '看台票', price: 680, available: 2000, total: 5000, description: '全场视野', perks: [] }
        ],
        status: 'onsale',
        isHot: true,
        tags: ['演唱会', '巡演', '华语']
      },
      {
        id: '2',
        title: '草莓音乐节 2024',
        artist: '群星',
        artistAvatar: '/api/placeholder/50/50',
        type: 'festival',
        coverImage: '/api/placeholder/400/200',
        venue: '上海世博公园',
        city: '上海',
        date: new Date('2024-05-01'),
        tickets: [
          { id: 't1', name: '单日票', price: 380, available: 5000, total: 10000, description: '单日入场', perks: [] },
          { id: 't2', name: '双日通票', price: 680, originalPrice: 760, available: 3000, total: 5000, description: '两日畅玩', perks: ['专属手环'] },
          { id: 't3', name: 'VIP通票', price: 1280, available: 500, total: 1000, description: '专属观演区', perks: ['专属休息区', '免费饮品', '快速通道'] }
        ],
        status: 'onsale',
        isHot: true,
        tags: ['音乐节', '户外', '摇滚']
      },
      {
        id: '3',
        title: '「安可」Livehouse 巡演',
        artist: '陈奕迅',
        artistAvatar: '/api/placeholder/50/50',
        type: 'liveshow',
        coverImage: '/api/placeholder/400/200',
        venue: 'MAO Livehouse',
        city: '深圳',
        date: new Date('2024-06-20'),
        tickets: [
          { id: 't1', name: '站席', price: 580, available: 0, total: 300, description: '沉浸体验', perks: [] },
          { id: 't2', name: '前排站席', price: 880, available: 0, total: 100, description: '近距离接触', perks: ['限定贴纸'] }
        ],
        status: 'soldout',
        isHot: false,
        tags: ['Livehouse', '小型演出']
      }
    ]

    setEvents(mockEvents)
  })

  // 添加到购物车
  const addToCart = (eventId: string, tierId: string, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.eventId === eventId && item.tierId === tierId)
      if (existing) {
        return prev.map(item =>
          item.eventId === eventId && item.tierId === tierId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { eventId, tierId, quantity }]
    })
  }

  // 创建订单
  const createOrder = (eventId: string, tierId: string, quantity: number): Order => {
    const event = events.find(e => e.id === eventId)
    const tier = event?.tickets.find(t => t.id === tierId)

    const order: Order = {
      id: `order_${Date.now()}`,
      eventId,
      eventTitle: event?.title || '',
      ticketTier: tier?.name || '',
      quantity,
      totalPrice: (tier?.price || 0) * quantity,
      status: 'pending',
      createdAt: new Date()
    }

    setOrders(prev => [...prev, order])
    return order
  }

  // 支付订单
  const payOrder = (orderId: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'paid', qrCode: `qr_${orderId}` }
        : order
    ))
  }

  return {
    events,
    orders,
    selectedEvent,
    setSelectedEvent,
    cart,
    addToCart,
    createOrder,
    payOrder
  }
}

// 演出卡片
const EventCard: React.FC<{
  event: MusicEvent
  onSelect: () => void
}> = ({ event, onSelect }) => {
  const lowestPrice = Math.min(...event.tickets.map(t => t.price))

  const typeLabels = {
    concert: '演唱会',
    festival: '音乐节',
    liveshow: 'Live',
    fanmeeting: '见面会'
  }

  return (
    <motion.div
      className="bg-dark-800 rounded-2xl overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
    >
      {/* 封面 */}
      <div className="relative aspect-[2/1]">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover"
        />

        {/* 标签 */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2 py-1 bg-primary-500 rounded-full text-xs text-white">
            {typeLabels[event.type]}
          </span>
          {event.isHot && (
            <span className="px-2 py-1 bg-red-500 rounded-full text-xs text-white">
              🔥 热门
            </span>
          )}
        </div>

        {/* 状态 */}
        <div className="absolute top-3 right-3">
          {event.status === 'soldout' && (
            <span className="px-2 py-1 bg-gray-500 rounded-full text-xs text-white">
              已售罄
            </span>
          )}
        </div>
      </div>

      {/* 信息 */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-1">{event.title}</h3>
        <p className="text-white/60 text-sm mb-2">{event.artist}</p>

        <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
          <span>📍 {event.city} · {event.venue}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/40 mb-3">
          <span>📅 {event.date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-primary-400 font-bold text-xl">¥{lowestPrice}</span>
            <span className="text-white/40 text-sm"> 起</span>
          </div>

          <button
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              event.status === 'onsale'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-500 text-white/60 cursor-not-allowed'
            }`}
            disabled={event.status !== 'onsale'}
          >
            {event.status === 'onsale' ? '立即购票' : '已售罄'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// 票档选择
const TicketSelection: React.FC<{
  event: MusicEvent
  onSelect: (tierId: string, quantity: number) => void
  onClose: () => void
}> = ({ event, onSelect, onClose }) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

  const handleBuy = () => {
    if (selectedTier) {
      onSelect(selectedTier, quantity)
    }
  }

  const selectedTicket = event.tickets.find(t => t.id === selectedTier)

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-lg bg-dark-800 rounded-t-3xl p-6"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">选择票档</h3>
          <button onClick={onClose} className="text-white/60 text-2xl">×</button>
        </div>

        {/* 演出信息 */}
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
          <img
            src={event.coverImage}
            alt=""
            className="w-20 h-12 rounded-lg object-cover"
          />
          <div>
            <h4 className="text-white font-medium">{event.title}</h4>
            <p className="text-sm text-white/60">
              {event.date.toLocaleDateString('zh-CN')} · {event.venue}
            </p>
          </div>
        </div>

        {/* 票档列表 */}
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {event.tickets.map(tier => {
            const isSoldOut = tier.available === 0
            const isSelected = selectedTier === tier.id

            return (
              <motion.div
                key={tier.id}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  isSoldOut
                    ? 'bg-white/5 opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-primary-500/20 ring-2 ring-primary-500'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => !isSoldOut && setSelectedTier(tier.id)}
                whileTap={!isSoldOut ? { scale: 0.98 } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-white font-medium">{tier.name}</span>
                    {tier.originalPrice && (
                      <span className="ml-2 text-xs text-white/40 line-through">
                        ¥{tier.originalPrice}
                      </span>
                    )}
                  </div>
                  <span className="text-primary-400 font-bold">¥{tier.price}</span>
                </div>

                <p className="text-sm text-white/60 mb-2">{tier.description}</p>

                {tier.perks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tier.perks.map((perk, i) => (
                      <span key={i} className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        {perk}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-2 text-xs text-white/40">
                  {isSoldOut ? '已售罄' : `剩余 ${tier.available} 张`}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* 数量选择 */}
        {selectedTier && (
          <div className="flex items-center justify-between mb-6">
            <span className="text-white/60">购买数量</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full bg-white/10 text-white"
              >
                -
              </button>
              <span className="text-white font-medium w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(4, quantity + 1))}
                className="w-8 h-8 rounded-full bg-white/10 text-white"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* 底部 */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white/60 text-sm">总计: </span>
            <span className="text-primary-400 font-bold text-xl">
              ¥{(selectedTicket?.price || 0) * quantity}
            </span>
          </div>
          <button
            onClick={handleBuy}
            disabled={!selectedTier}
            className="px-8 py-3 bg-primary-500 rounded-full text-white font-medium
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认购买
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 我的订单
const MyOrders: React.FC<{
  orders: Order[]
}> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl block mb-4">🎫</span>
        <p className="text-white/60">暂无订单</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-dark-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">{order.eventTitle}</h4>
            <span className={`px-2 py-1 rounded-full text-xs ${
              order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
              order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {order.status === 'paid' ? '已支付' :
               order.status === 'pending' ? '待支付' :
               order.status === 'confirmed' ? '已确认' : '已使用'}
            </span>
          </div>

          <p className="text-sm text-white/60 mb-2">
            {order.ticketTier} × {order.quantity}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-primary-400 font-bold">¥{order.totalPrice}</span>
            {order.status === 'paid' && (
              <button className="px-4 py-1 bg-white/10 rounded-full text-sm text-white">
                查看电子票
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// 主界面
interface TicketStoreProps {
  className?: string
}

export const TicketStore: React.FC<TicketStoreProps> = ({ className }) => {
  const {
    events,
    orders,
    selectedEvent,
    setSelectedEvent,
    createOrder,
    payOrder
  } = useTicketStore()

  const [activeTab, setActiveTab] = useState<'events' | 'orders'>('events')
  const [filter, setFilter] = useState<EventType | 'all'>('all')

  const filteredEvents = useMemo(() => {
    if (filter === 'all') return events
    return events.filter(e => e.type === filter)
  }, [events, filter])

  const handlePurchase = (tierId: string, quantity: number) => {
    if (selectedEvent) {
      const order = createOrder(selectedEvent.id, tierId, quantity)
      payOrder(order.id)
      setSelectedEvent(null)
    }
  }

  return (
    <div className={`p-6 bg-dark-900 rounded-2xl ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">票务商城</h3>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'events' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            演出
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm ${
              activeTab === 'orders' ? 'bg-primary-500 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            我的订单 {orders.length > 0 && `(${orders.length})`}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'events' ? (
          <motion.div
            key="events"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 筛选 */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {[
                { key: 'all', label: '全部' },
                { key: 'concert', label: '演唱会' },
                { key: 'festival', label: '音乐节' },
                { key: 'liveshow', label: 'Livehouse' },
                { key: 'fanmeeting', label: '见面会' }
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setFilter(item.key as typeof filter)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    filter === item.key
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* 演出列表 */}
            <div className="grid gap-4">
              {filteredEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="orders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MyOrders orders={orders} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 票档选择弹窗 */}
      <AnimatePresence>
        {selectedEvent && (
          <TicketSelection
            event={selectedEvent}
            onSelect={handlePurchase}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default TicketStore
