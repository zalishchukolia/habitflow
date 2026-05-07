import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://360323fea97c63ef90d77648fd0371df@o4511345154523136.ingest.de.sentry.io/4511345160355920',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: 'production',
})

posthog.init('phc_mtMJmszhT4GT282nc6k2gTziJ582qPPXdSA8XHdBGowY', {
  api_host: '/api/ph',
  ui_host: 'https://us.posthog.com',
  person_profiles: 'identified_only',
  loaded: (ph) => {
    console.log('PostHog loaded, distinct_id:', ph.get_distinct_id())
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)