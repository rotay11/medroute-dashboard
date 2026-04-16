import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://cozy-upliftment-production-7486.up.railway.app'

const planColors = { BASIC: '#1D9E75', PROFESSIONAL: '#0C447C', ENTERPRISE: '#BA7517' }
const statusColors = { ACTIVE: '#1D9E75', TRIAL: '#BA7517', SUSPENDED: '#791F1F', CANCELLED: '#888' }

export default function SuperAdminPage() {
  const [token, setToken] = useState(localStorage.getItem('sa_token') || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { if (token) loadData() }, [token])

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(API + '/api/auth/login', { email, password })
      if (res.data.driver.role !== 'SUPERADMIN') {
        setError('Super admin access required')
        setLoading(false)
        return
      }
      localStorage.setItem('sa_token', res.data.accessToken)
      setToken(res.data.accessToken)
    } catch (err) {
      setError('Invalid credentials')
    }
    setLoading(false)
  }

  async function loadData() {
    setLoading(true)
    try {
      const res = await axios.get(API + '/api/superadmin/pharmacies', {
        headers: { Authorization: 'Bearer ' + token }
      })
      setData(res.data)
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('sa_token')
        setToken('')
      }
    }
    setLoading(false)
  }

  async function updatePharmacy(id, updates) {
    try {
      await axios.patch(API + '/api/superadmin/pharmacies/' + id, updates, {
        headers: { Authorization: 'Bearer ' + token }
      })
      loadData()
    } catch (err) {
      alert('Update failed')
    }
  }

  const s = {
    page: { minHeight: '100vh', background: '#f4f6f9', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
    header: { background: '#1a1a1a', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { display: 'flex', alignItems: 'center', gap: 10 },
    logoIcon: { width: 32, height: 32, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 },
    logoText: { color: '#fff', fontWeight: 700, fontSize: 16 },
    loginWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' },
    loginCard: { background: '#fff', borderRadius: 16, padding: 40, width: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
    input: { width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, marginBottom: 12, outline: 'none', boxSizing: 'border-box' },
    btn: { width: '100%', padding: '12px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '24px 32px 0' },
    statCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
    statNum: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#888' },
    table: { margin: '24px 32px', background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
    th: { padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', background: '#f9f9f9', textAlign: 'left' },
    td: { padding: '12px 16px', fontSize: 13, color: '#333', borderTop: '1px solid #f0f0f0' },
    badge: (color) => ({ background: color + '20', color: color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }),
    actionBtn: (color) => ({ background: color, color: '#fff', border: 'none', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', marginRight: 4 }),
  }

  if (!token) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={s.logo}>
            <div style={s.logoIcon}>M</div>
            <div style={s.logoText}>MedRouteRx Super Admin</div>
          </div>
        </div>
        <div style={s.loginWrap}>
          <div style={s.loginCard}>
            <h2 style={{ marginBottom: 8, fontSize: 22 }}>Super Admin Login</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Taylor Pharmacy Consulting</p>
            {error && <div style={{ background: '#ffeaea', color: '#791F1F', padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}
            <form onSubmit={login}>
              <input style={s.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input style={s.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const filtered = (data?.pharmacies || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.licenseNumber || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoIcon}>M</div>
          <div style={s.logoText}>MedRouteRx Super Admin</div>
        </div>
        <button onClick={() => { localStorage.removeItem('sa_token'); setToken('') }} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Sign out</button>
      </div>

      {loading && !data ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading...</div>
      ) : (
        <>
          <div style={s.statGrid}>
            {[
              { label: 'Total Pharmacies', value: data?.stats?.totalPharmacies || 0, color: '#333' },
              { label: 'Active Paying', value: data?.stats?.activePharmacies || 0, color: '#1D9E75' },
              { label: 'Trial', value: data?.stats?.trialPharmacies || 0, color: '#BA7517' },
              { label: 'Monthly Revenue', value: '$' + (data?.stats?.totalMRR || 0).toLocaleString(), color: '#0C447C' },
            ].map((stat, i) => (
              <div key={i} style={s.statCard}>
                <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={s.table}>
            <div style={{ padding: '16px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>All Pharmacies</h3>
              <input placeholder="Search pharmacies..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, width: 220, outline: 'none' }} />
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Pharmacy', 'License', 'Plan', 'Status', 'Drivers', 'Deliveries', 'MRR', 'Trial Ends', 'Actions'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={s.td}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{p.address}</div>
                    </td>
                    <td style={s.td}>{p.licenseNumber} {p.licenseState}</td>
                    <td style={s.td}><span style={s.badge(planColors[p.plan] || '#888')}>{p.plan}</span></td>
                    <td style={s.td}><span style={s.badge(statusColors[p.status] || '#888')}>{p.status}</span></td>
                    <td style={s.td}>{p.driverCount}</td>
                    <td style={s.td}>{p.totalDeliveries}</td>
                    <td style={s.td} style={{ ...s.td, fontWeight: 600, color: '#1D9E75' }}>${p.monthlyRevenue}</td>
                    <td style={s.td}>{p.trialEndsAt ? new Date(p.trialEndsAt).toLocaleDateString() : '—'}</td>
                    <td style={s.td}>
                      {p.status !== 'ACTIVE' && <button style={s.actionBtn('#1D9E75')} onClick={() => updatePharmacy(p.id, { status: 'ACTIVE' })}>Activate</button>}
                      {p.status !== 'SUSPENDED' && <button style={s.actionBtn('#791F1F')} onClick={() => updatePharmacy(p.id, { status: 'SUSPENDED' })}>Suspend</button>}
                      <select style={{ fontSize: 11, padding: '3px 6px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }} value={p.plan} onChange={e => updatePharmacy(p.id, { plan: e.target.value })}>
                        <option value="BASIC">Basic</option>
                        <option value="PROFESSIONAL">Professional</option>
                        <option value="ENTERPRISE">Enterprise</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No pharmacies found</div>}
          </div>
        </>
      )}
    </div>
  )
}
