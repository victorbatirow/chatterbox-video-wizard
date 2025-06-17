import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.tsx'
import './index.css'

// Handle both Vite and Create React App environment variables
const getEnvVar = (key: string, fallback: string) => {
  // Try Vite first (import.meta.env)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[`VITE_${key}`] || import.meta.env[`REACT_APP_${key}`] || fallback;
  }
  
  // Fallback to window environment or default
  if (typeof window !== 'undefined' && (window as any).__ENV__) {
    return (window as any).__ENV__[`REACT_APP_${key}`] || fallback;
  }
  
  return fallback;
};

createRoot(document.getElementById("root")!).render(
  <Auth0Provider
    domain={getEnvVar("AUTH0_DOMAIN", "auth.pamba.app")}
    clientId={getEnvVar("AUTH0_CLIENT_ID", "hcdMCKsScucHyZcp6mWiKUhL48hdC54I")}
    authorizationParams={{
      redirect_uri: window.location.origin + '/dashboard',
      audience: getEnvVar("AUTH0_AUDIENCE", 'https://dev-y1uvqekat854n8q4.us.auth0.com/api/v2/')
    }}
  >
    <App />
  </Auth0Provider>
);