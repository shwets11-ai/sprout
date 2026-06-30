import { useState, useEffect } from 'react'
import AuthGuard from './components/AuthGuard'
import DashboardScreen from './components/DashboardScreen'
import LogScreen from './components/LogScreen'
import ScheduleScreen from './components/ScheduleScreen'
import { signOut, getSession } from './lib/supabase'

function AppContent() {
  const [screen, setScreen] = useState('dashboard')
  const [logCategory, setLogCategory] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [userEmail, setUserEmail] = useState(null)

  useEffect(() => {
    getSession().then((data) => {
      if (data.session?.user?.email) {
        setUserEmail(data.session.user.email)
      }
    })
  }, [])

  const handleSaved = () => setRefreshKey((k) => k + 1)

  const handleLogout = async () => {
    await signOut()
    setUserEmail(null)
  }

  return (
    <div className="min-h-screen bg-sprout-green-50">
      <header className="bg-white shadow-sm border-b border-sprout-green-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-sprout-green-700 flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            Sprout
          </h1>
          <div className="flex items-center gap-2">
            {userEmail && (
              <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[120px]">{userEmail}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors min-h-[44px] px-3"
              aria-label="Sign out"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 animate-fade-in" key={refreshKey + screen}>
        {screen === 'dashboard' && (
          <DashboardScreen onLog={(cat) => { setLogCategory(cat); setScreen('log') }} />
        )}
        {screen === 'log' && (
          <LogScreen initialCategory={logCategory} onBack={() => setScreen('dashboard')} onSaved={handleSaved} />
        )}
        {screen === 'schedule' && (
          <ScheduleScreen onBack={() => setScreen('dashboard')} />
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-sprout-green-200 safe-area-bottom z-10">
        <div className="max-w-lg mx-auto flex justify-around items-center h-16">
          <button onClick={() => setScreen('dashboard')}
            className={`flex flex-col items-center px-4 py-1 min-w-[64px] min-h-[44px] justify-center transition-colors duration-150 ${
              screen === 'dashboard' ? 'text-sprout-green-600' : 'text-gray-400 hover:text-gray-600'
            }`} aria-label="Dashboard">
            <span className="text-xl">📊</span>
            <span className="text-xs font-semibold">Today</span>
          </button>
          <button onClick={() => { setLogCategory(null); setScreen('log') }}
            className={`flex flex-col items-center px-4 py-1 min-w-[64px] min-h-[44px] justify-center transition-colors duration-150 ${
              screen === 'log' ? 'text-sprout-green-600' : 'text-gray-400 hover:text-gray-600'
            }`} aria-label="Log activity">
            <span className="text-xl">➕</span>
            <span className="text-xs font-semibold">Log</span>
          </button>
          <button onClick={() => setScreen('schedule')}
            className={`flex flex-col items-center px-4 py-1 min-w-[64px] min-h-[44px] justify-center transition-colors duration-150 ${
              screen === 'schedule' ? 'text-sprout-green-600' : 'text-gray-400 hover:text-gray-600'
            }`} aria-label="Schedule">
            <span className="text-xl">📅</span>
            <span className="text-xs font-semibold">Schedule</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

function App() {
  return (
    <AuthGuard>
      <AppContent />
    </AuthGuard>
  )
}

export default App
