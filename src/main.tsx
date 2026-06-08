import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider.tsx'
import { Toaster } from './components/ui/sonner.tsx'

registerSW({
  immediate: true,
})

let deferredPrompt: any = null

window.addEventListener('beforeinstallprompt', (e: any) => {
  if (!e) return

  e.preventDefault()
  deferredPrompt = e

  setTimeout(() => {
    window.dispatchEvent(new Event("show-install-popup"))
  }, 1000)
})

export function installApp() {
  if (!deferredPrompt) return

  deferredPrompt.prompt()

  deferredPrompt.userChoice.then(() => {
    deferredPrompt = null
  })
}

function setThemeColor(color: string) {
  let meta = document.querySelector("meta[name='theme-color']")

  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    document.head.appendChild(meta)
  }

  meta.setAttribute('content', color)
}

function updateThemeBar() {
  const isDark = document.documentElement.classList.contains('dark')
  setThemeColor(isDark ? '#111827' : '#ffffff')
}

function ThemeWatcher() {
  useEffect(() => {
    updateThemeBar()

    const observer = new MutationObserver(() => {
      updateThemeBar()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system">
        <ThemeWatcher />
        <App />
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
)