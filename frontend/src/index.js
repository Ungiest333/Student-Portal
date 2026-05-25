import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const savedDarkMode = localStorage.getItem('darkMode');
document.documentElement.setAttribute(
  'data-theme',
  savedDarkMode === null || JSON.parse(savedDarkMode) ? 'dark' : 'light'
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
