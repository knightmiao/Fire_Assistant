import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { consumeSupabaseAuthCallback } from './lib/supabaseAuthCallback'

function mount() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void consumeSupabaseAuthCallback().finally(mount)
