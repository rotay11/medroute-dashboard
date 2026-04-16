import React, { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import DownloadPage from './pages/DownloadPage'
import DriverApp from './pages/DriverApp'
import PortalApp from './pages/PortalApp'
import LandingPage from './pages/LandingPage'
import SuperAdminPage from './pages/SuperAdminPage'
import RegisterPage from './pages/RegisterPage'
import FacilityPortal from './pages/FacilityPortal'
import DashboardPage from './pages/DashboardPage'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('dispatcher_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  function handleLogin(userData) {
    localStorage.setItem('dispatcher_user', JSON.stringify(userData))
    setUser(userData)
  }

  function handleLogout() {
    localStorage.removeItem('dispatcher_user')
    localStorage.removeItem('dispatcher_token')
    setUser(null)
  }

  if (window.location.pathname === '/download') return <DownloadPage />
  if (window.location.pathname === '/driver') return <DriverApp />
  if (window.location.pathname === '/portal') return <PortalApp />
  if (window.location.pathname === '/landing') return <LandingPage />
  if (window.location.pathname === '/superadmin') return <SuperAdminPage />
  if (window.location.pathname === '/register') return <RegisterPage />
  if (window.location.pathname === '/facility') return <FacilityPortal />
  if (!user) return <LoginPage onLogin={handleLogin} />
  return <DashboardPage user={user} onLogout={handleLogout} />
}
