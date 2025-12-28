import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode.react'
import { triggerHaptic } from '@/hooks/useGestures'

export interface ShareContent {
  type: 'song' | 'playlist' | 'album' | 'artist' | 'lyrics'
  id: string
  title: string
  subtitle?: string
  imageUrl?: string
  url: string
}

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  content: ShareContent | null
}

// 分享平台配置
const sharePlatforms = [
  {
    id: 'wechat',
    name: '微信',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#07C160">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.046c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89l-.005-.029v-.002zm-1.41 2.304c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z"/>
      </svg>
    ),
    color: '#07C160',
  },
  {
    id: 'weibo',
    name: '微博',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#E6162D">
        <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.737 5.439l-.002.004zM9.05 17.219c-.384.616-1.208.884-1.829.602-.612-.279-.793-.991-.406-1.593.379-.595 1.176-.861 1.793-.601.622.263.82.972.442 1.592zm1.27-1.627c-.141.237-.449.353-.689.253-.236-.09-.313-.361-.177-.586.138-.227.436-.346.672-.24.239.09.315.36.18.573h.014zm.176-2.719c-1.893-.493-4.033.45-4.857 2.118-.836 1.704-.026 3.591 1.886 4.21 1.983.64 4.318-.341 5.132-2.179.8-1.793-.201-3.642-2.161-4.149zm7.563-1.224c-.346-.105-.579-.18-.401-.649.386-1.02.425-1.899.011-2.529-.77-1.172-2.887-1.108-5.312-.031 0 0-.761.334-.566-.272.37-1.217.315-2.237-.264-2.82-1.312-1.32-4.8.05-7.795 3.06C1.522 10.63 0 12.854 0 14.754c0 3.637 4.669 5.849 9.234 5.849 5.981 0 9.957-3.473 9.957-6.228 0-1.665-1.403-2.608-2.132-2.726zm3.818-8.767c-1.726-1.897-4.27-2.607-6.569-2.118-.605.127-.992.71-.865 1.3.126.588.713.965 1.318.838 1.548-.331 3.28.147 4.445 1.434 1.166 1.288 1.486 3.06.982 4.573-.195.582.121 1.212.706 1.406.585.189 1.219-.117 1.41-.696.743-2.211.305-4.838-1.427-6.737zm-2.298 2.533c-.799-.879-1.98-1.209-3.047-.982a1.009 1.009 0 00-.79 1.19c.116.527.637.861 1.166.745.548-.116 1.15.049 1.558.499.407.45.518 1.052.357 1.594a1.01 1.01 0 00.656 1.272c.53.176 1.101-.111 1.276-.637.32-.983.137-2.097-.576-2.949l-.6.268z"/>
      </svg>
    ),
    color: '#E6162D',
  },
  {
    id: 'moments',
    name: '朋友圈',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#07C160">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm5.5 14.5c-2.5 2-6.5 2-9 0-.5-.5 0-1.5.5-1s5.5 1.5 8 0c.5-.5 1 .5.5 1zm-.5-3c-.83 0-1.5-.67-1.5-1.5S16.17 10.5 17 10.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-10 0c-.83 0-1.5-.67-1.5-1.5S6.17 10.5 7 10.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
      </svg>
    ),
    color: '#07C160',
  },
  {
    id: 'qq',
    name: 'QQ',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#12B7F5">
        <path d="M21.395 15.035a39.548 39.548 0 00-.803-2.264l-1.079-2.695c.001-.032.014-.332.014-.571 0-.355-.035-.71-.07-1.065a10.18 10.18 0 00-.166-1.056 7.693 7.693 0 00-.452-1.395 6.932 6.932 0 00-.653-1.129 6.175 6.175 0 00-.93-1.037 6.012 6.012 0 00-1.185-.842 5.717 5.717 0 00-1.358-.528 5.535 5.535 0 00-1.456-.194c-.495 0-.989.065-1.456.194a5.689 5.689 0 00-1.357.528c-.435.229-.826.512-1.185.842-.358.331-.672.7-.93 1.037-.257.34-.478.713-.653 1.129-.175.417-.327.86-.453 1.395-.089.344-.134.697-.166 1.056-.035.355-.07.71-.07 1.065 0 .239.013.539.014.571l-1.079 2.695a39.407 39.407 0 00-.803 2.264c-.56 1.74-.994 4.262.056 5.046.763.566 1.998-.29 3.236-.988.259-.148.535-.304.81-.453.252-.135.502-.268.75-.397.054-.027.107-.054.16-.082.218.44.458.873.727 1.284.217.332.458.66.715.975.255.314.524.61.811.885.288.275.587.524.904.747.317.224.648.415.999.574.35.158.712.278 1.097.358.386.08.783.12 1.192.12a6.49 6.49 0 001.192-.12c.385-.08.748-.2 1.098-.358.35-.16.681-.35.998-.574.317-.223.617-.472.904-.747.287-.275.556-.57.811-.885.257-.316.498-.643.715-.975.27-.411.51-.844.728-1.284.052.028.105.055.159.082.247.13.498.262.75.397.275.15.551.305.81.453 1.239.698 2.473 1.554 3.236.988 1.05-.784.617-3.306.056-5.046z"/>
      </svg>
    ),
    color: '#12B7F5',
  },
  {
    id: 'copy',
    name: '复制链接',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    ),
    color: 'currentColor',
  },
  {
    id: 'qrcode',
    name: '二维码',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8 6h2v-2h-2v2zm0-4h2v-2h-2v2zm2 2h2v-2h-2v2zm0 2h2v-2h-2v2zm2-2h2v-2h-2v2zm0-4h2v-2h-2v2zm2 2h2v-2h-2v2z"/>
      </svg>
    ),
    color: 'currentColor',
  },
]

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, content }) => {
  const [showQR, setShowQR] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async (platformId: string) => {
    if (!content) return

    triggerHaptic('light')

    switch (platformId) {
      case 'copy':
        await navigator.clipboard.writeText(content.url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
      case 'qrcode':
        setShowQR(true)
        break
      case 'wechat':
        // 调用微信 SDK
        // @ts-ignore
        if (window.wx) {
          // 微信分享
        } else {
          setShowQR(true) // 没有微信 SDK 时显示二维码
        }
        break
      case 'weibo':
        window.open(
          `https://service.weibo.com/share/share.php?url=${encodeURIComponent(content.url)}&title=${encodeURIComponent(content.title)}`,
          '_blank'
        )
        break
      case 'qq':
        window.open(
          `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(content.url)}&title=${encodeURIComponent(content.title)}`,
          '_blank'
        )
        break
      default:
        break
    }
  }

  if (!content) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-dark-900 rounded-t-3xl border-t border-white/10 shadow-2xl z-50"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {showQR ? (
              // QR Code View
              <div className="p-6 flex flex-col items-center">
                <h3 className="text-lg font-semibold text-white mb-4">扫描二维码分享</h3>
                <div className="p-4 bg-white rounded-2xl mb-4">
                  <QRCode value={content.url} size={200} />
                </div>
                <p className="text-sm text-white/60 mb-4">{content.title}</p>
                <button
                  onClick={() => setShowQR(false)}
                  className="px-6 py-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  返回
                </button>
              </div>
            ) : (
              // Share Options View
              <div className="p-6">
                {/* Content Preview */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl mb-6">
                  {content.imageUrl && (
                    <img
                      src={content.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{content.title}</h3>
                    {content.subtitle && (
                      <p className="text-sm text-white/60 truncate">{content.subtitle}</p>
                    )}
                  </div>
                </div>

                {/* Share Platforms */}
                <div className="grid grid-cols-4 gap-4">
                  {sharePlatforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handleShare(platform.id)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      {platform.icon}
                      <span className="text-xs text-white/60">
                        {platform.id === 'copy' && copied ? '已复制' : platform.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Cancel Button */}
                <button
                  onClick={onClose}
                  className="w-full mt-6 py-3 bg-white/5 rounded-xl text-white/60 hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ShareModal
