import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Enregistrement du Service Worker pour la PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ ServiceWorker Historia enregistré avec succès:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Échec enregistrement ServiceWorker:', error);
      });
  });
} else if ('serviceWorker' in navigator) {
  // En développement, enregistrer également pour tester le comportement PWA si besoin
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

