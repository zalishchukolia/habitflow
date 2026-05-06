import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'

posthog.init('phc_vsj2aobx6g5hdqhy5J9DbHiBV28G96dzQir7cn4qqBHj', {
  api_host: '/ph',
  ui_host: 'https://us.posthog.com',
  person_profiles: 'identified_only',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)