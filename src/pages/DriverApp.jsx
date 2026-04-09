import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = 'https://cozy-upliftment-production-7486.up.railway.app'

function getToken() { return localStorage.getItem('driver_token') }
function setToken(t) { localStorage.setItem('driver_token', t) }
function clearToken() { localStorage.removeItem('driver_token'); localStorage.removeItem('driver_data') }
function getDriver() { try { return JSON.parse(localStorage.getItem('driver_data')) } catch { return null } }
function setDriver(d) { localStorage.setItem('driver_data', JSON.stringify(d)) }

export default function DriverApp() {
  const [screen, setScreen] = useState('login')
  const [driver, setDriverState] = useState(null)
  const [route, setRoute] = useState([])
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [scannedItems, setScannedItems] = useState([])
  const [manualId, setManualId] = useState('')
  const [flashMsg, setFlashMsg] = useState(null)
  const [sigText, setSigText] = useState('')
  const [refused, setRefused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = getToken()
    const d = getDriver()
    if (t && d) { setDriverState(d); loadRoute(t); setScreen('home') }
  }, [])

  async function loadRoute(token) {
    try {
      const { data } = await axios.get(API + '/api/bundle/route', {
        headers: { Authorization: 'Bearer ' + (token || getToken()) }
      })
      setRoute(data.route || [])
    } catch {}
  }

  async function handleLogin(email, password) {
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(API + '/api/auth/login', { email, password, deviceId: 'pwa-ios', platform: 'web' })
      setToken(data.accessToken)
      setDriver(data.driver)
      setDriverState(data.driver)
      await loadRoute(data.accessToken)
      setScreen('home')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
    setLoading(false)
  }

  function handleLogout() {
    clearToken(); setDriverState(null); setRoute([]); setScreen('login')
  }

  async function handleScan(rxId) {
    if (!rxId) return
    try {
      const { data } = await axios.post(API + '/api/scan',
        { rxId: rxId.toUpperCase(), scanType: 'PICKUP', gpsLat: 37.6879, gpsLng: -122.0561 },
        { headers: { Authorization: 'Bearer ' + getToken() } }
      )
      setScannedItems(prev => [...prev, data.package])
      setFlashMsg({ type: 'success', text: 'Scanned: ' + rxId })
      if (data.bundleProgress) {
        setRoute(prev => prev.map(b => b.id === selectedBundle.id ? { ...b, progress: data.bundleProgress } : b))
      }
    } catch (err) {
      const code = err.response?.data?.code
      const msg = code === 'ALREADY_SCANNED' ? 'Already scanned' : code === 'ITEM_NOT_ON_MANIFEST' ? 'Not on manifest' : 'Scan failed'
      setFlashMsg({ type: 'error', text: msg })
    }
    setTimeout(() => setFlashMsg(null), 2500)
    setManualId('')
  }

  async function handleDeliver() {
    if (!refused && !sigText.trim()) { alert('Please add recipient name or mark as refused'); return }
    setLoading(true)
    try {
      await axios.post(API + '/api/delivery',
        { bundleId: selectedBundle.id, recipientName: sigText, notes: '', gpsLat: 37.6879, gpsLng: -122.0561, refused: refused, scannedRxIds: scannedItems.map(i => i.rxId) },
        { headers: { Authorization: 'Bearer ' + getToken() } }
      )
      await loadRoute()
      setSelectedBundle(null); setScannedItems([]); setSigText(''); setRefused(false); setScreen('home')
    } catch (err) {
      alert(err.response?.data?.error || 'Delivery failed')
    }
    setLoading(false)
  }

  function handleNavigate(bundle) {
    const addr = encodeURIComponent(bundle.address || '')
    window.open('maps://?daddr=' + addr, '_blank') || window.open('https://www.google.com/maps/dir/?api=1&destination=' + addr, '_blank')
  }

  const allScanned = selectedBundle && scannedItems.length >= (selectedBundle.packages?.length || 0)

  if (screen === 'login') return <LoginScreen onLogin={handleLogin} loading={loading} error={error} />

  if (screen === 'scan' && selectedBundle) return (
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => { setScreen('home'); setSelectedBundle(null); setScannedItems([]) }}>← Back</button>
        <div style={s.headerTitle}>Scan medications</div>
        <div style={s.headerSub}>Stop {selectedBundle.stopOrder} of {route.length}</div>
      </div>
      <div style={s.body}>
        <div style={s.addressCard}>
          <div style={s.addressLabel}>Delivery address</div>
          <div style={s.addressText}>{selectedBundle.address}</div>
          <button style={s.navBtn} onClick={() => handleNavigate(selectedBundle)}>Navigate with Maps</button>
        </div>
        <div style={s.progressCard}>
          <div style={s.progressRow}>
            <span style={s.progressLabel}>Pickup progress</span>
            <span style={s.progressCount}>{scannedItems.length} / {selectedBundle.packages?.length || 0}</span>
          </div>
          <div style={s.progressBg}>
            <div style={{ ...s.progressFill, width: (selectedBundle.packages?.length ? Math.round(scannedItems.length / selectedBundle.packages.length * 100) : 0) + '%' }} />
          </div>
        </div>
        {flashMsg && <div style={{ ...s.flash, background: flashMsg.type === 'success' ? '#E1F5EE' : '#FCEBEB' }}>{flashMsg.text}</div>}
        <div style={s.manualRow}>
          <input style={s.manualInput} value={manualId} onChange={e => setManualId(e.target.value.toUpperCase())} placeholder="RX-XXXXX" autoCapitalize="characters" autoCorrect="off" />
          <button style={s.lookupBtn} onClick={() => handleScan(manualId)}>Lookup</button>
        </div>
        <div style={s.sectionLabel}>Items for this stop</div>
        {selectedBundle.packages?.map(pkg => {
          const done = scannedItems.some(s => s.rxId === pkg.rxId)
          return (
            <div key={pkg.rxId} style={s.itemRow}>
              <div style={{ ...s.itemDot, ...(done ? s.itemDotDone : {}) }}>{done ? '✓' : ''}</div>
              <div style={s.itemInfo}>
                <div style={s.itemId}>{pkg.rxId}</div>
                <div style={s.itemDrug}>{pkg.medication} {pkg.dosage}</div>
              </div>
              {pkg.urgent && <span style={s.urgentBadge}>Urgent</span>}
            </div>
          )
        })}
        {allScanned && (
          <button style={s.confirmBtn} onClick={() => setScreen('deliver')}>Confirm & deliver</button>
        )}
      </div>
    </div>
  )

  if (screen === 'deliver' && selectedBundle) return (
    <div style={s.screen}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => setScreen('scan')}>← Back</button>
        <div style={s.headerTitle}>Confirm delivery</div>
        <div style={s.headerSub}>{selectedBundle.address?.split(',')[0]}</div>
      </div>
      <div style={s.body}>
        <div style={s.deliveryCard}>
          <div style={s.sectionLabel}>Recipient name</div>
          <input style={s.sigInput} value={sigText} onChange={e => setSigText(e.target.value)} placeholder="Enter recipient name" />
          <div style={{ ...s.sectionLabel, marginTop: 16 }}>Items delivered</div>
          {scannedItems.map(item => (
            <div key={item.rxId} style={s.itemRow}>
              <div style={{ ...s.itemDot, ...s.itemDotDone }}>✓</div>
              <div style={s.itemInfo}>
                <div style={s.itemId}>{item.rxId}</div>
                <div style={s.itemDrug}>{item.medication} {item.dosage}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          style={{...s.confirmBtn, background: refused ? '#FCEBEB' : 'transparent', color: refused ? '#791F1F' : '#E24B4A', border: '1px solid #E24B4A', marginBottom: 10}}
          onClick={() => { setRefused(!refused); if (!refused) setSigText(''); }}
        >
          {refused ? '✓ Marked as refused' : 'Patient refused delivery'}
        </button>
        <button style={{ ...s.confirmBtn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={handleDeliver}>
          {loading ? 'Completing...' : 'Complete delivery'}
        </button>
      </div>
    </div>
  )

  return (
    <div style={s.screen}>
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>Good morning, {driver?.firstName}</div>
          <div style={s.headerSub}>Clayworth Pharmacy</div>
        </div>
        <button style={s.logoutBtn} onClick={handleLogout}>Sign out</button>
      </div>
      <div style={s.body}>
        <div style={s.statsRow}>
          <div style={s.statBox}><div style={s.statNum}>{route.length}</div><div style={s.statLbl}>Stops</div></div>
          <div style={s.statBox}><div style={{ ...s.statNum, color: '#1D9E75' }}>{route.filter(b => b.status === 'DELIVERED').length}</div><div style={s.statLbl}>Done</div></div>
          <div style={s.statBox}><div style={s.statNum}>{route.filter(b => b.status !== 'DELIVERED').length}</div><div style={s.statLbl}>Left</div></div>
        </div>
        <div style={s.sectionLabel}>Today's route</div>
        {route.length === 0 && <div style={s.emptyMsg}>No deliveries assigned yet</div>}
        {route.map(bundle => (
          <div key={bundle.id} style={s.stopCard} onClick={() => { setSelectedBundle(bundle); setScannedItems([]); setScreen('scan') }}>
            <div style={s.stopNum}>{bundle.stopOrder}</div>
            <div style={s.stopInfo}>
              <div style={s.stopAddress}>{bundle.address?.split(',')[0]}</div>
              <div style={s.stopSub}>{bundle.address?.split(',').slice(1).join(',').trim()}</div>
              <div style={s.stopMeta}>{bundle.packages?.length || 0} items{bundle.hasUrgent ? ' · Urgent' : ''}</div>
            </div>
            <div style={{ ...s.stopStatus, ...(bundle.status === 'DELIVERED' ? s.stopDone : {}) }}>
              {bundle.status === 'DELIVERED' ? '✓' : '→'}
            </div>
          </div>
        ))}
      </div>
      <div style={s.installHint}>Add to Home Screen in Safari for the best experience</div>
    </div>
  )
}

function LoginScreen({ onLogin, loading, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div style={s.loginPage}>
      <div style={s.loginCard}>
        <div style={s.loginLogo}><div style={s.loginLogoIcon}>M</div><div><div style={s.loginTitle}>MedRouteRx Driver</div><div style={s.loginSub}>Clayworth Pharmacy</div></div></div>
        <div style={s.loginField}><label style={s.loginLabel}>Email</label><input style={s.loginInput} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
        <div style={s.loginField}><label style={s.loginLabel}>Password</label><input style={s.loginInput} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
        {error && <div style={s.loginError}>{error}</div>}
        <button style={s.loginBtn} disabled={loading} onClick={() => onLogin(email, password)}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </div>
    </div>
  )
}

const s = {
  screen:       { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5', maxWidth: 480, margin: '0 auto' },
  header:       { background: '#1D9E75', padding: '16px 16px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle:  { fontSize: 17, fontWeight: 600, color: '#fff' },
  headerSub:    { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  backBtn:      { background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, cursor: 'pointer', padding: 0 },
  logoutBtn:    { background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', fontSize: 12, borderRadius: 6, padding: '5px 10px', cursor: 'pointer' },
  body:         { flex: 1, padding: 14 },
  statsRow:     { display: 'flex', gap: 10, marginBottom: 16 },
  statBox:      { flex: 1, background: '#fff', borderRadius: 8, padding: '10px', textAlign: 'center' },
  statNum:      { fontSize: 22, fontWeight: 600, color: '#333' },
  statLbl:      { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' },
  sectionLabel: { fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
  emptyMsg:     { textAlign: 'center', color: '#aaa', fontSize: 13, padding: 30 },
  stopCard:     { background: '#fff', borderRadius: 10, padding: '12px 14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' },
  stopNum:      { width: 28, height: 28, borderRadius: '50%', background: '#1D9E75', color: '#fff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stopInfo:     { flex: 1 },
  stopAddress:  { fontSize: 13, fontWeight: 600, color: '#333' },
  stopSub:      { fontSize: 11, color: '#888', marginTop: 1 },
  stopMeta:     { fontSize: 11, color: '#1D9E75', marginTop: 3 },
  stopStatus:   { fontSize: 16, color: '#ccc' },
  stopDone:     { color: '#1D9E75' },
  addressCard:  { background: '#fff', borderRadius: 10, padding: 14, marginBottom: 12 },
  addressLabel: { fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  addressText:  { fontSize: 13, color: '#333', marginBottom: 10 },
  navBtn:       { width: '100%', padding: '10px', background: '#085041', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  progressCard: { background: '#fff', borderRadius: 10, padding: 12, marginBottom: 12 },
  progressRow:  { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel:{ fontSize: 11, color: '#666' },
  progressCount:{ fontSize: 11, fontWeight: 600, color: '#333' },
  progressBg:   { background: '#e0e0e0', borderRadius: 4, height: 6, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#1D9E75', borderRadius: 4, transition: 'width 0.3s' },
  flash:        { padding: '10px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, textAlign: 'center', marginBottom: 10 },
  manualRow:    { display: 'flex', gap: 8, marginBottom: 14 },
  manualInput:  { flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff' },
  lookupBtn:    { background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, padding: '0 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  itemRow:      { display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', gap: 10 },
  itemDot:      { width: 20, height: 20, borderRadius: '50%', border: '1.5px solid #ccc', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 },
  itemDotDone:  { background: '#1D9E75', borderColor: '#1D9E75', color: '#fff' },
  itemInfo:     { flex: 1 },
  itemId:       { fontSize: 11, fontWeight: 600, color: '#333' },
  itemDrug:     { fontSize: 11, color: '#666', marginTop: 1 },
  urgentBadge:  { background: '#FCEBEB', color: '#791F1F', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 8 },
  confirmBtn:   { width: '100%', padding: 14, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 16 },
  deliveryCard: { background: '#fff', borderRadius: 10, padding: 14, marginBottom: 16 },
  sigInput:     { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  installHint:  { textAlign: 'center', fontSize: 11, color: '#bbb', padding: '12px 16px' },
  loginPage:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8', padding: 20 },
  loginCard:    { background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 380 },
  loginLogo:    { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  loginLogoIcon:{ width: 44, height: 44, background: '#1D9E75', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 'bold' },
  loginTitle:   { fontSize: 17, fontWeight: 600, color: '#333' },
  loginSub:     { fontSize: 12, color: '#888' },
  loginField:   { marginBottom: 14 },
  loginLabel:   { display: 'block', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
  loginInput:   { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' },
  loginError:   { background: '#FCEBEB', color: '#791F1F', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
  loginBtn:     { width: '100%', padding: 13, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
}
