import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Aggressive service-worker update checks so redeploys land fast.
// registerType: 'autoUpdate' + skipWaiting/clientsClaim in vite.config.ts
// handle the install-and-reload; these hooks make sure the SW notices new
// versions without waiting for an opportunistic lifecycle event.
if ('serviceWorker' in navigator) {
  const checkForUpdate = () => {
    navigator.serviceWorker
      .getRegistration()
      .then((registration) => {
        registration?.update()
      })
      .catch(() => {
        // Offline or no registration yet — ignore; next check will retry.
      })
  }

  // Every minute while the tab is open.
  setInterval(checkForUpdate, 60_000)

  // Whenever the user switches back to the tab.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForUpdate()
    }
  })
}
