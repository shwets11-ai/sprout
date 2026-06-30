import { useState } from 'react'
import { signUp } from '../lib/supabase'

export default function SignupScreen({ onAuth, onBack }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { data, error } = await signUp(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else if (data?.session) {
      setSuccess(true)
      if (onAuth) onAuth(data.session)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-sprout-green-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <span className="text-5xl">🌱</span>
          <h2 className="text-xl font-bold text-sprout-green-700 mt-4">Check your email!</h2>
          <p className="text-gray-500 text-sm mt-2">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
          <button onClick={onBack} className="btn-secondary mt-6">
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sprout-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🌱</span>
          <h1 className="text-2xl font-bold text-sprout-green-700 mt-2">Sprout</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Sign Up</h2>

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
              placeholder="At least 6 characters"
              className="input-field"
              required
              minLength={6}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button type="button" onClick={onBack} className="text-sprout-green-600 font-semibold hover:underline">
              Sign In
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
