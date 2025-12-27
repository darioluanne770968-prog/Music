import { create } from 'zustand'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

interface Modal {
  id: string
  component: React.ComponentType<ModalProps>
  props?: Record<string, unknown>
}

interface ModalProps {
  onClose: () => void
}

interface UIStore {
  // State
  isSidebarOpen: boolean
  isMobileMenuOpen: boolean
  isSearchOpen: boolean
  toasts: Toast[]
  modals: Modal[]
  isLoading: boolean
  loadingText: string
  activeTab: string

  // Actions
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  setSearchOpen: (open: boolean) => void
  toggleSearch: () => void

  // Toast Actions
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
  clearToasts: () => void

  // Modal Actions
  openModal: (modal: Omit<Modal, 'id'>) => void
  closeModal: (id?: string) => void
  closeAllModals: () => void

  // Loading Actions
  setLoading: (loading: boolean, text?: string) => void

  // Tab Actions
  setActiveTab: (tab: string) => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial State
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  toasts: [],
  modals: [],
  isLoading: false,
  loadingText: '',
  activeTab: 'home',

  // Sidebar Actions
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Mobile Menu Actions
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Search Actions
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  // Toast Actions
  showToast: (toast) => {
    const id = generateId()
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 3000,
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().hideToast(id)
      }, newToast.duration)
    }
  },

  hideToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  clearToasts: () => set({ toasts: [] }),

  // Modal Actions
  openModal: (modal) => {
    const id = generateId()
    set((state) => ({
      modals: [...state.modals, { ...modal, id }],
    }))
  },

  closeModal: (id) => {
    const { modals } = get()
    if (id) {
      set({ modals: modals.filter((m) => m.id !== id) })
    } else if (modals.length > 0) {
      set({ modals: modals.slice(0, -1) })
    }
  },

  closeAllModals: () => set({ modals: [] }),

  // Loading Actions
  setLoading: (isLoading, loadingText = '') => set({ isLoading, loadingText }),

  // Tab Actions
  setActiveTab: (activeTab) => set({ activeTab }),
}))

// Helper functions for common toasts
export const toast = {
  success: (message: string, duration?: number) => {
    useUIStore.getState().showToast({ type: 'success', message, duration })
  },
  error: (message: string, duration?: number) => {
    useUIStore.getState().showToast({ type: 'error', message, duration })
  },
  info: (message: string, duration?: number) => {
    useUIStore.getState().showToast({ type: 'info', message, duration })
  },
  warning: (message: string, duration?: number) => {
    useUIStore.getState().showToast({ type: 'warning', message, duration })
  },
}
