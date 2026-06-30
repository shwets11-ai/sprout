import { useState, useEffect } from 'react'
import { getSession, onAuthStateChange } from '../lib/supabase'
import LoginScreen from './LoginScreen'

export default function AuthGuard({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSession().then((data) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener?.subscription?.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-sprout-green-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl">🌱</span>
          <p className="text-gray-400 mt-3 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginScreen onAuth={(s) => setSession(s)} />
  }

  return children
}
