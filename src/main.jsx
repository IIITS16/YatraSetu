import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    if (import.meta.env.PROD) {
      await navigator.serviceWorker.register('/sw.js')
      return
    }

    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  })
}
