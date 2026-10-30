import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ConfigFaltando from './components/ConfigFaltando.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { firebaseConfigurado } from './firebase.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {firebaseConfigurado ? (
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    ) : (
      <ConfigFaltando />
    )}
  </React.StrictMode>,
)
