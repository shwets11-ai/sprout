import { useEffect } from 'react'
import { acceptInvite } from '../db/database'

export default function InvitationHandler({ onAccepted }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('invite')
    if (token) {
      acceptInvite(token)
        .then(() => {
          // Clean URL and notify parent
          window.history.replaceState({}, document.title, window.location.pathname)
          if (onAccepted) onAccepted()
        })
        .catch(() => {
          window.history.replaceState({}, document.title, window.location.pathname)
        })
    }
  }, [])

  return null
}
