import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/css/reset.css';
import './assets/css/theme.css';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </BrowserRouter>
);

 
