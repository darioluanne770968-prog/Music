/**
 * 性能优化工具
 * 包含缓存、防抖、节流、懒加载等
 */

// ==================== 内存缓存 ====================

interface CacheItem<T> {
  value: T
  expiry: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()
  private maxSize: number

  constructor(maxSize = 100) {
    this.maxSize = maxSize
  }

  set<T>(key: string, value: T, ttlMs = 5 * 60 * 1000): void {
    // 如果缓存满了，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlMs
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const cache = new MemoryCache()

// ==================== LRU 缓存 ====================

class LRUCache<T> {
  private cache = new Map<string, T>()
  private maxSize: number

  constructor(maxSize = 50) {
    this.maxSize = maxSize
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // 移到最后（最近使用）
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }
}

export const lruCache = new LRUCache(100)

// ==================== 防抖 ====================

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
      timeoutId = null
    }, delay)
  }
}

// ==================== 节流 ====================

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// ==================== 请求去重 ====================

const pendingRequests = new Map<string, Promise<any>>()

export async function dedupeRequest<T>(
  key: string,
  request: () => Promise<T>
): Promise<T> {
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>
  }

  const promise = request().finally(() => {
    pendingRequests.delete(key)
  })

  pendingRequests.set(key, promise)
  return promise
}

// ==================== 带缓存的 Fetch ====================

interface FetchWithCacheOptions {
  ttl?: number
  forceRefresh?: boolean
}

export async function fetchWithCache<T>(
  url: string,
  options?: RequestInit & FetchWithCacheOptions
): Promise<T> {
  const cacheKey = `fetch:${url}:${JSON.stringify(options)}`

  if (!options?.forceRefresh) {
    const cached = cache.get<T>(cacheKey)
    if (cached) return cached
  }

  const response = await fetch(url, options)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  cache.set(cacheKey, data, options?.ttl)

  return data
}

// ==================== 懒加载图片 ====================

export function lazyLoadImage(
  src: string,
  placeholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(src)
    img.onerror = reject
    img.src = src
  })
}

// ==================== 虚拟滚动辅助 ====================

export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan = 3
): { start: number; end: number } {
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2
  const end = Math.min(totalItems, start + visibleCount)

  return { start, end }
}

// ==================== 分批处理 ====================

export async function batchProcess<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  batchSize = 5
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(processFn))
    results.push(...batchResults)
  }

  return results
}

// ==================== Web Worker 辅助 ====================

export function createWorker(fn: Function): Worker {
  const blob = new Blob([`onmessage = ${fn.toString()}`], {
    type: 'application/javascript'
  })
  return new Worker(URL.createObjectURL(blob))
}

export function runInWorker<T, R>(fn: (data: T) => R, data: T): Promise<R> {
  return new Promise((resolve, reject) => {
    const worker = createWorker((e: MessageEvent<T>) => {
      const result = fn(e.data)
      postMessage(result)
    })

    worker.onmessage = (e: MessageEvent<R>) => {
      resolve(e.data)
      worker.terminate()
    }

    worker.onerror = (e) => {
      reject(e)
      worker.terminate()
    }

    worker.postMessage(data)
  })
}

// ==================== 性能监控 ====================

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []

  start(name: string): void {
    this.metrics.push({
      name,
      startTime: performance.now()
    })
  }

  end(name: string): number {
    const metric = this.metrics.find(m => m.name === name && !m.endTime)
    if (metric) {
      metric.endTime = performance.now()
      metric.duration = metric.endTime - metric.startTime
      return metric.duration
    }
    return 0
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics.filter(m => m.duration !== undefined)
  }

  clear(): void {
    this.metrics = []
  }

  report(): void {
    const completed = this.getMetrics()
    console.group('Performance Metrics')
    completed.forEach(m => {
      console.log(`${m.name}: ${m.duration?.toFixed(2)}ms`)
    })
    console.groupEnd()
  }
}

export const perfMonitor = new PerformanceMonitor()

// ==================== 内存监控 ====================

export function getMemoryUsage(): { used: number; total: number } | null {
  // @ts-ignore - 非标准 API
  if (performance.memory) {
    return {
      // @ts-ignore
      used: performance.memory.usedJSHeapSize,
      // @ts-ignore
      total: performance.memory.totalJSHeapSize
    }
  }
  return null
}

// ==================== 帧率监控 ====================

export function measureFPS(callback: (fps: number) => void): () => void {
  let frames = 0
  let lastTime = performance.now()
  let animationId: number

  const loop = () => {
    frames++
    const now = performance.now()

    if (now - lastTime >= 1000) {
      callback(frames)
      frames = 0
      lastTime = now
    }

    animationId = requestAnimationFrame(loop)
  }

  animationId = requestAnimationFrame(loop)

  return () => cancelAnimationFrame(animationId)
}

// ==================== 预加载 ====================

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

export function preloadAudio(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    audio.oncanplaythrough = () => resolve()
    audio.onerror = reject
    audio.src = src
    audio.load()
  })
}

// 批量预加载
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(preloadImage))
}

// ==================== IndexedDB 缓存 ====================

class IndexedDBCache {
  private dbName: string
  private storeName: string
  private db: IDBDatabase | null = null

  constructor(dbName = 'appCache', storeName = 'cache') {
    this.dbName = dbName
    this.storeName = storeName
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)

      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = () => {
        const db = request.result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const item = {
        key,
        value,
        expiry: ttlMs ? Date.now() + ttlMs : null
      }

      const request = store.put(item)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)

      const request = store.get(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const item = request.result
        if (!item) {
          resolve(null)
          return
        }

        if (item.expiry && Date.now() > item.expiry) {
          this.delete(key)
          resolve(null)
          return
        }

        resolve(item.value)
      }
    })
  }

  async delete(key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const request = store.delete(key)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)

      const request = store.clear()
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

export const idbCache = new IndexedDBCache()

export default {
  cache,
  lruCache,
  idbCache,
  debounce,
  throttle,
  dedupeRequest,
  fetchWithCache,
  lazyLoadImage,
  calculateVisibleRange,
  batchProcess,
  createWorker,
  runInWorker,
  perfMonitor,
  getMemoryUsage,
  measureFPS,
  preloadImage,
  preloadAudio,
  preloadImages
}
