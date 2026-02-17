// React entry point for the application.
// Responsible for mounting the app, enabling routing, and applying global settings.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import axios from 'axios'


// Global styles (theme, resets, fonts)
import './index.css'

// Root application component
import App from './App.jsx'

// Auto logout on expired token
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config.url.includes('/api/auth/')
      if (!isAuthRoute) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Create the React root and render the application
createRoot(document.getElementById('root')).render(
  // StrictMode enables additional checks and warnings in development
  <StrictMode>
    {/* BrowserRouter enables client-side routing throughout the app */}  
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
