import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        zIndex: 9999
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: toast.type === 'success' ? '#161616' : toast.type === 'error' ? '#1a0000' : '#161616',
            border: `1px solid ${toast.type === 'success' ? '#00ff87' : toast.type === 'error' ? '#ff4444' : '#ff8c00'}`,
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            color: toast.type === 'success' ? '#00ff87' : toast.type === 'error' ? '#ff4444' : '#ff8c00',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            minWidth: '250px',
            animation: 'slideIn 0.2s ease',
          }}>
            {toast.type === 'success' ? '✓ ' : toast.type === 'error' ? '✗ ' : '⚠ '}
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}