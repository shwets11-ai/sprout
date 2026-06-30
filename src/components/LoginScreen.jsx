import { useState } from 'react'
import { signIn } from '../lib/supabase'
import SignupScreen from './SignupScreen'

export default function LoginScreen({ onAuth }) {
  const [showSignup, setShowSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (showSignup) {
    return <SignupScreen onAuth={onAuth} onBack={() => setShowSignup(false)} />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { data, error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (data?.session) {
      if (onAuth) onAuth(data.session)
    }
  }

  return (
    <div className="min-h-screen bg-sprout-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🌱</span>
          <h1 className="text-2xl font-bold text-sprout-green-700 mt-2">Sprout</h1>
          <p className="text-gray-400 text-sm mt-1">Toddler Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Welcome back</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <button type="button" onClick={() => setShowSignup(true)} className="text-sprout-green-600 font-semibold hover:underline">
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
