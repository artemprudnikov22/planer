import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

// Register PWA service worker
if (import.meta.env.PROD) {
  registerSW({
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        window.location.reload()
      }
    },
    onOfflineReady() {
      console.log('App is ready for offline use')
    },
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
