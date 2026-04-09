import React, { useState } from 'react'
import axios from 'axios'

const API = 'https://cozy-upliftment-production-7486.up.railway.app'

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(API + '/api/auth/login', { email, password })
      if (!['ADMIN','SUPERVISOR','DISPATCHER'].includes(data.driver.role)) {
        setError('Access denied. Dispatcher or admin account required.')
        setLoading(false)
        return
      }
      localStorage.setItem('dispatcher_token', data.accessToken)
      onLogin(data.driver)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>M</div>
          <div>
            <div style={styles.logoTitle}>MedRouteRx</div>
            <div style={styles.logoSub}>Dispatcher Dashboard</div>
          </div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="dispatch@medroute.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="placeholderpassword"
              required
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div style={styles.hint}>Use your dispatcher or admin account to sign in.</div>
      </div>
    </div>
  )
}

const styles = {
  page:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  card:      { background: '#fff', borderRadius: 12, padding: '40px', width: '100%', maxWidth: 400, boxShadow: '0 2px 20px rgba(0,0,0,0.08)' },
  logo:      { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 },
  logoIcon:  { width: 44, height: 44, background: '#1D9E75', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 'bold' },
  logoTitle: { fontSize: 18, fontWeight: 600, color: '#333' },
  logoSub:   { fontSize: 12, color: '#888' },
  field:     { marginBottom: 16 },
  label:     { display: 'block', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 },
  input:     { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, color: '#333', outline: 'none' },
  error:     { background: '#FCEBEB', color: '#791F1F', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  btn:       { width: '100%', padding: '12px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600 },
  hint:      { marginTop: 20, fontSize: 12, color: '#aaa', textAlign: 'center' },
}
