import { create } from 'zustand'

// Global state store for authentication
// Handles user info, JWT token, and persistence via localStorage
const useStore = create((set) => ({
  // Auth state (initialized from localStorage to persist login on refresh)
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,

  // Login action:
  // - Save user and token to localStorage
  // - Update global auth state
  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },

  // Logout action:
  // - Clear localStorage
  // - Reset global auth state
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))

export default useStore
