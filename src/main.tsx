import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for instant offline cache and mobile installation
if (typeof window !== 'undefined') {
  if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          registration.update();
        })
        .catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
    });
  }

  // Request persistent storage so browser data is never auto-evicted
  if ('storage' in navigator && 'persist' in navigator.storage) {
    navigator.storage.persist().then((isPersisted) => {
      if (isPersisted) {
        console.log('Storage is persisted durably.');
      }
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

