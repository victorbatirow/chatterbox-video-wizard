
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain="dev-y1uvqekat854n8q4.us.auth0.com"
    clientId="hcdMCKsScucHyZcp6mWiKUhL48hdC54I"
    authorizationParams={{
      redirect_uri: window.location.origin + '/dashboard'
    }}
    useRefreshTokens={true}
    cacheLocation="localstorage"
  >
    <App />
  </Auth0Provider>
);
