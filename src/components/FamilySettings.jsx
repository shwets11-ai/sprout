import { useState, useEffect } from 'react'
import { getMyFamilies, getFamilyMembers, getToddlers, createToddler, inviteMember, getPendingInvitations } from '../db/database'

export default function FamilySettings({ onBack }) {
  const [families, setFamilies] = useState([])
  const [selectedFamily, setSelectedFamily] = useState(null)
  const [members, setMembers] = useState([])
  const [toddlers, setToddlers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [newToddlerName, setNewToddlerName] = useState('')
  const [newToddlerBirth, setNewToddlerBirth] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  const loadData = async () => {
    setLoading(true)
    const fams = await getMyFamilies()
    setFamilies(fams)
    if (fams.length > 0) {
      const fam = selectedFamily || fams[0]
      setSelectedFamily(fam)
      const [mems, todd, invs] = await Promise.all([
        getFamilyMembers(fam.id),
        getToddlers(fam.id),
        getPendingInvitations(fam.id),
      ])
      setMembers(mems)
      setToddlers(todd)
      setInvitations(invs)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedFamily) return
    try {
      await inviteMember(selectedFamily.id, inviteEmail.trim())
      setInviteEmail('')
      setMsg('Invitation sent!')
      setTimeout(() => setMsg(null), 2000)
      loadData()
    } catch (err) {
      setMsg(err.message)
    }
  }

  const handleAddToddler = async () => {
    if (!newToddlerName.trim() || !selectedFamily) return
    try {
      await createToddler(selectedFamily.id, newToddlerName.trim(), newToddlerBirth || null)
      setNewToddlerName('')
      setNewToddlerBirth('')
      setMsg('Toddler added!')
      setTimeout(() => setMsg(null), 2000)
      loadData()
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center">←</button>
        <h1 className="text-xl font-bold text-gray-800">Family Settings</h1>
      </div>

      {msg && <div className="bg-sprout-green-100 border border-sprout-green-300 text-sprout-green-700 text-sm px-4 py-2 rounded-xl mb-4">{msg}</div>}

      {loading ? <p className="text-gray-400 text-center py-10">Loading...</p> : (
        <>
          {/* Family selector */}
          <div className="flex gap-2 mb-4">
            {families.map((f) => (
              <button key={f.id} onClick={() => { setSelectedFamily(f); loadData() }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedFamily?.id === f.id ? 'bg-sprout-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {f.name}
              </button>
            ))}
          </div>

          {selectedFamily && (
            <div className="space-y-6">
              {/* Family Members */}
              <div className="card">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Family Members</h2>
                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.user_id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-sprout-green-100 flex items-center justify-center text-sprout-green-600 font-bold text-sm">
                        {m.user_id?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-sm text-gray-700 font-mono text-xs">{m.user_id?.slice(0, 8) || 'Unknown'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invite */}
              <div className="card">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Invite Caretaker</h2>
                <div className="flex gap-2">
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@example.com" className="input-field text-sm flex-1" />
                  <button onClick={handleInvite} disabled={!inviteEmail.trim()} className="btn-primary text-sm px-4">Send</button>
                </div>
                {invitations.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-400 mb-1">Pending invitations:</p>
                    {invitations.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between text-sm text-gray-500 py-1">
                        <span>{inv.email}</span>
                        <span className="text-xs text-yellow-500">Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toddlers */}
              <div className="card">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Toddlers</h2>
                <div className="space-y-2 mb-3">
                  {toddlers.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <span>👶</span>
                      <span className="font-medium">{t.name}</span>
                      {t.birth_date && <span className="text-gray-400">({t.birth_date})</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newToddlerName} onChange={(e) => setNewToddlerName(e.target.value)} placeholder="Name" className="input-field text-sm flex-1" />
                  <input type="date" value={newToddlerBirth} onChange={(e) => setNewToddlerBirth(e.target.value)} className="input-field text-sm w-36" />
                  <button onClick={handleAddToddler} disabled={!newToddlerName.trim()} className="btn-primary text-sm px-3">+</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
