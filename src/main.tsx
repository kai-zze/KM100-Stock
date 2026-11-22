import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Global uncaught error listener to prevent blank white screens
window.addEventListener('error', (event) => {
  console.error('KM100 Uncaught Exception:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('KM100 Unhandled Promise Rejection:', event.reason);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
