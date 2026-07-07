import { useState } from 'react'
import { createFamily, createToddler } from '../db/database'

export default function ToddlerSetup({ onComplete }) {
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const family = await createFamily('My Family')
      const toddler = await createToddler(family.id, name.trim(), birthDate || null)
      if (onComplete) onComplete(toddler)
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-sprout-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🌱</span>
          <h1 className="text-2xl font-bold text-sprout-green-700 mt-2">Welcome to Sprout!</h1>
          <p className="text-gray-400 text-sm mt-1">Let's set up your little sprout.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">{error}</div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Toddler's Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emma" className="input-field" required />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Birth Date (optional)</label>
            <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input-field" />
          </div>

          <button type="submit" disabled={saving || !name.trim()} className="btn-primary w-full">
            {saving ? 'Creating...' : '🌱 Get Started'}
          </button>
        </form>
      </div>
    </div>
  )
}
