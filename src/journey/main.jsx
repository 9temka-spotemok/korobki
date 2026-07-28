import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/journey.css'

const root = document.getElementById('journey-root')
if (!root) {
  throw new Error('Не найден #journey-root для cinematic journey')
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
