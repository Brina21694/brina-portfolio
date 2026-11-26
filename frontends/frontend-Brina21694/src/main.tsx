import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './translations' // initialise i18n (langue FR/EN) avant l'affichage
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
