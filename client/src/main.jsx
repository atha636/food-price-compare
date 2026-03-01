import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <GoogleOAuthProvider clientId="353483488446-ug5le50l0huum33nbaaedtakv7upsqfv.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
</StrictMode>,
)
