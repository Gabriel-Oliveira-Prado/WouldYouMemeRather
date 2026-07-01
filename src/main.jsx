import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.jsx'

const consoleStyle = "background: #111; color: #fff; font-size: 14px; padding: 10px; border-radius: 4px; font-family: monospace;";
console.log(
  "%c👨‍💻 Desenvolvido por Gabriel Oliveira Prado\n© Copyright 2026 - All rights reserved\n🔗 GitHub: https://github.com/Gabriel-Oliveira-Prado",
  consoleStyle
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)