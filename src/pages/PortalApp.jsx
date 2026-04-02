import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://cozy-upliftment-production-7486.up.railway.app'

function getToken() { return localStorage.getItem('portal_token') }
function setToken(t) { localStorage.setItem('portal_token', t) }
function clearToken() { localStorage.removeItem('portal_token'); localStorage.removeItem('portal_user') }
function getUser() { try { return JSON.parse(localStorage.getItem('portal_user')) } catch { return null } }
function setUser(u) { localStorage.setItem('portal_user', JSON.stringify(u)) }

export default function PortalApp() {
  const [screen, setScreen] = useState('login')
  const [user, setUserState] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState('patient')
  const [facilities, setFacilities] = useState([])
  const [caregiverData, setCaregiverData] = useState(null)
  const [selectedFacility, setSelectedFacility] = useState('')
  const [careFirstName, setCareFirstName] = useState('')
  const [careLastName, setCareLastName] = useState('')
  const [careDob, setCareDob] = useState('')
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    const t = getToken()
    const u = getUser()
    if (t && u) { setUserState(u); loadDeliveries(t, u.type === 'facility' ? 'facility' : 'patient'); setScreen('home') }
  }, [])

  async function loadDeliveries(token, type) {
    try {
      const t = token || getToken()
      const u = type || (getUser()?.type === 'facility' ? 'facility' : 'patient')
      const url = u === 'facility'
        ? API + '/api/portal/facility/' + t + '/packages'
        : API + '/api/portal/patient/' + t + '/packages'
      const { data } = await axios.get(url)
      setDeliveries(data.packages || [])
    } catch {}
  }

  async function handlePatientLogin(email, dob) {
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(API + '/api/portal/patient/login', { email, dob })
      setToken(data.patient.portalToken)
      setUser(data.patient)
      setUserState(data.patient)
      await loadDeliveries(data.patient.portalToken, 'patient')
      setScreen('home')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your email and date of birth.')
    }
    setLoading(false)
  }

  async function handleFacilityLogin(email, password) {
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(API + '/api/portal/facility/login', { email, password })
      setToken(data.facility.id)
      setUser({...data.facility, type:'facility'})
      setUserState({...data.facility, type:'facility'})
      await loadDeliveries(data.facility.id, 'facility')
      setScreen('home')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    }
    setLoading(false)
  }

  function handleLogout() {
    clearToken(); setUserState(null); setDeliveries([]); setScreen('login')
  }

  async function sendMessage() {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)
    try {
      const token = user?.portalToken
      const res = await axios.post(API + '/api/portal/patient/' + token + '/chat', { message: userMsg })
      setMessages(prev => [...prev, { role: 'agent', text: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', text: 'Sorry I could not process your question. Please contact Clayworth Pharmacy at (510) 537-9402.' }])
    }
    setChatLoading(false)
  }

  function getStatusColor(status) {
    if (status === 'DELIVERED') return '#1D9E75'
    if (status === 'IN_TRANSIT') return '#BA7517'
    if (status === 'PICKED_UP') return '#0C447C'
    return '#888'
  }

  function getStatusLabel(status) {
    if (status === 'DELIVERED') return 'Delivered'
    if (status === 'IN_TRANSIT') return 'Out for delivery'
    if (status === 'PICKED_UP') return 'Picked up from pharmacy'
    if (status === 'PENDING') return 'Preparing'
    return status
  }

  function getStatusIcon(status) {
    if (status === 'DELIVERED') return '✓'
    if (status === 'IN_TRANSIT') return '→'
    if (status === 'PICKED_UP') return '↑'
    return '○'
  }


  if (screen === 'caregiver') return (
    <div style={p.container}>
      <div style={p.header}>
        <div style={p.logo}>💊</div>
        <div style={p.brand}>MedRoute</div>
        <div style={p.tagline}>Delivery Status</div>
      </div>
      <div style={p.card}>
        <div style={{textAlign:'center', marginBottom:20}}>
          <div style={{fontSize:32, marginBottom:8}}>📦</div>
          <div style={{fontSize:16, fontWeight:600, color:'#333'}}>{caregiverData?.patient?.firstName} {caregiverData?.patient?.lastInitial}.</div>
          <div style={{fontSize:13, color:'#888', marginTop:4}}>Delivery Status</div>
        </div>
        <div style={{background:'#f9f9f9', borderRadius:10, padding:16, marginBottom:16}}>
          <div style={{fontSize:12, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8}}>Current Status</div>
          <div style={{fontSize:15, fontWeight:600, color: caregiverData?.delivery?.status === 'DELIVERED' ? '#1D9E75' : '#BA7517'}}>
            {caregiverData?.delivery?.status === 'IN_TRANSIT' ? '→ Out for delivery' :
             caregiverData?.delivery?.status === 'PICKED_UP' ? '📦 Picked up from pharmacy' :
             caregiverData?.delivery?.status === 'DELIVERED' ? '✓ Delivered' : '⏳ Being prepared'}
          </div>
          {caregiverData?.delivery?.itemCount > 0 && (
            <div style={{fontSize:13, color:'#555', marginTop:6}}>{caregiverData.delivery.itemCount} item{caregiverData.delivery.itemCount > 1 ? 's' : ''} on the way</div>
          )}
          {caregiverData?.delivery?.driverName && (
            <div style={{fontSize:13, color:'#555', marginTop:4}}>Driver: {caregiverData.delivery.driverName}</div>
          )}
        </div>
        <div style={{background:'#FFF8EC', borderRadius:10, padding:14, marginBottom:16, borderLeft:'3px solid #BA7517'}}>
          <div style={{fontSize:12, color:'#633806'}}>For more information contact Clayworth Pharmacy</div>
          <div style={{fontSize:14, fontWeight:600, color:'#633806', marginTop:4}}>(510) 537-9402</div>
        </div>
        <button onClick={() => { setScreen('login'); setCaregiverData(null) }} style={{...p.btn, background:'#888'}}>Check another patient</button>
      </div>
    </div>
  )
  if (screen === 'login') return (
    <div style={p.page}>
      <div style={p.card}>
        <div style={p.logo}>
          <div style={p.logoIcon}>M</div>
          <div>
            <div style={p.logoTitle}>MedRoute</div>
            <div style={p.logoSub}>Delivery Tracking Portal</div>
          </div>
        </div>

        <div style={p.toggleRow}>
          <button style={{...p.toggleBtn,...(loginType==='patient'?p.toggleActive:{})}} onClick={()=>{setLoginType('patient');setError('')}}>Patient</button>
          <button style={{...p.toggleBtn,...(loginType==='facility'?p.toggleActive:{})}} onClick={()=>{setLoginType('facility');setError('')}}>Facility</button>
        </div>

        {loginType === 'patient' ? (
          <PatientLoginForm onLogin={handlePatientLogin} loading={loading} error={error} />
        ) : (
          <FacilityLoginForm onLogin={handleFacilityLogin} loading={loading} error={error} />
        )}

        <div style={p.hint}>Track your medication deliveries from Clayworth Pharmacy</div>
      </div>
    </div>
  )

  return (
    <div style={p.screen}>
      <div style={p.header}>
        <div>
          <div style={p.headerTitle}>Delivery Tracking</div>
          <div style={p.headerSub}>{user?.firstName} {user?.lastName || user?.name}</div>
        </div>
        <button style={p.logoutBtn} onClick={handleLogout}>Sign out</button>
        <button onClick={() => { setShowChat(!showChat); if (!showChat && messages.length === 0) setMessages([{ role: 'agent', text: 'Hi ' + user?.firstName + '! I can help you track your medication delivery. What would you like to know?' }]) }} style={{...p.logoutBtn, background:'rgba(255,255,255,0.3)', marginLeft:8}}>
          {showChat ? 'Close chat' : '💬 Ask about my delivery'}
        </button>
      </div>

      <div style={p.body}>
        <div style={p.sectionLabel}>Your deliveries</div>

        {deliveries.length === 0 && (
          <div style={p.emptyCard}>
            <div style={p.emptyIcon}>○</div>
            <div style={p.emptyTitle}>No deliveries found</div>
            <div style={p.emptySub}>Your medication deliveries will appear here</div>
          </div>
        )}

        {deliveries.map(delivery => (
          <div key={delivery.id} style={p.deliveryCard}>
            <div style={p.deliveryHeader}>
              <div style={{...p.statusBadge, background: getStatusColor(delivery.status) + '20', color: getStatusColor(delivery.status)}}>
                {getStatusIcon(delivery.status)} {getStatusLabel(delivery.status)}
              </div>
              {delivery.urgent && <span style={p.urgentBadge}>Urgent</span>}
            </div>

            <div style={p.drugName}>{delivery.medication} {delivery.dosage}</div>
            <div style={p.rxId}>RX: {delivery.rxId}</div>

            {delivery.status === 'DELIVERED' && delivery.deliveredAt && (
              <div style={p.deliveredAt}>
                Delivered {new Date(delivery.deliveredAt).toLocaleDateString()} at {new Date(delivery.deliveredAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
              </div>
            )}

            {delivery.status === 'IN_TRANSIT' && (
              <div style={p.inTransitMsg}>
                <div style={p.pulsingDot} />
                Your driver is on the way
              </div>
            )}

            {delivery.status === 'PICKED_UP' && (
              <div style={p.pickedUpMsg}>Picked up from pharmacy — delivery soon</div>
            )}

            {delivery.status === 'PENDING' && (
              <div style={p.pendingMsg}>Being prepared at Clayworth Pharmacy</div>
            )}

            <div style={p.timeline}>
              {[
                { label: 'Order received', done: true },
                { label: 'Picked up from pharmacy', done: ['PICKED_UP','IN_TRANSIT','DELIVERED'].includes(delivery.status) },
                { label: 'Out for delivery', done: ['IN_TRANSIT','DELIVERED'].includes(delivery.status) },
                { label: 'Delivered', done: delivery.status === 'DELIVERED' },
              ].map((step, i) => (
                <div key={i} style={p.timelineStep}>
                  <div style={{...p.timelineDot, background: step.done ? '#1D9E75' : '#e0e0e0', border: step.done ? 'none' : '2px solid #ddd'}} />
                  <div style={{...p.timelineLabel, color: step.done ? '#333' : '#aaa'}}>{step.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {showChat && (
        <div style={{position:'fixed', bottom:80, right:16, width:320, background:'#fff', borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.15)', border:'1px solid #e0e0e0', zIndex:1000, display:'flex', flexDirection:'column', maxHeight:440}}>
          <div style={{background:'#1D9E75', padding:'12px 16px', borderRadius:'16px 16px 0 0', display:'flex', alignItems:'center', gap:8}}>
            <div style={{width:32, height:32, background:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16}}>💊</div>
            <div>
              <div style={{color:'#fff', fontWeight:600, fontSize:14}}>MedRoute Assistant</div>
              <div style={{color:'rgba(255,255,255,0.75)', fontSize:11}}>Clayworth Pharmacy</div>
            </div>
          </div>
          <div style={{flex:1, overflowY:'auto', padding:12, display:'flex', flexDirection:'column', gap:8, minHeight:200, maxHeight:280}}>
            {messages.map((msg, i) => (
              <div key={i} style={{display:'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'}}>
                <div style={{
                  maxWidth:'85%', padding:'8px 12px', borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  background: msg.role === 'user' ? '#1D9E75' : '#f5f5f5',
                  color: msg.role === 'user' ? '#fff' : '#333',
                  fontSize:13, lineHeight:1.5
                }}>{msg.text}</div>
              </div>
            ))}
            {chatLoading && (
              <div style={{display:'flex', justifyContent:'flex-start'}}>
                <div style={{background:'#f5f5f5', padding:'8px 12px', borderRadius:'12px 12px 12px 0', fontSize:13, color:'#888'}}>Typing...</div>
              </div>
            )}
          </div>
          <div style={{padding:12, borderTop:'1px solid #eee', display:'flex', gap:8}}>
            <input
              style={{flex:1, border:'1px solid #ddd', borderRadius:8, padding:'8px 10px', fontSize:13, outline:'none'}}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about your delivery..."
            />
            <button onClick={sendMessage} disabled={chatLoading} style={{background:'#1D9E75', color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontSize:13, cursor:'pointer', fontWeight:600}}>
              Send
            </button>
          </div>
        </div>
      )}
      <div style={p.footer}>
          Powered by Clayworth Pharmacy · MedRoute
        </div>
      </div>
    </div>
  )
}

function PatientLoginForm({ onLogin, loading, error }) {
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  return (
    <div>
      <div style={p.field}><label style={p.label}>Email address</label><input style={p.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" /></div>
      <div style={p.field}><label style={p.label}>Date of birth</label><input style={p.input} type="date" value={dob} onChange={e=>setDob(e.target.value)} /></div>
      {error && <div style={p.error}>{error}</div>}
      <button style={p.btn} disabled={loading} onClick={()=>onLogin(email,dob)}>{loading?'Signing in...':'Track my delivery'}</button>
    </div>
  )
}

function FacilityLoginForm({ onLogin, loading, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  return (
    <div>
      <div style={p.field}><label style={p.label}>Email address</label><input style={p.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="facility@email.com" /></div>
      <div style={p.field}><label style={p.label}>Password</label><input style={p.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" /></div>
      {error && <div style={p.error}>{error}</div>}
      <button style={p.btn} disabled={loading} onClick={()=>onLogin(email,password)}>{loading?'Signing in...':'View deliveries'}</button>
    </div>
  )
}

const p = {
  page:         {minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8',padding:20},
  card:         {background:'#fff',borderRadius:12,padding:32,width:'100%',maxWidth:400,boxShadow:'0 2px 20px rgba(0,0,0,0.08)'},
  logo:         {display:'flex',alignItems:'center',gap:12,marginBottom:24},
  logoIcon:     {width:44,height:44,background:'#1D9E75',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:22,fontWeight:'bold'},
  logoTitle:    {fontSize:18,fontWeight:600,color:'#333'},
  logoSub:      {fontSize:12,color:'#888'},
  toggleRow:    {display:'flex',gap:4,marginBottom:20,background:'#f5f5f5',padding:4,borderRadius:8},
  toggleBtn:    {flex:1,padding:'8px',border:'none',background:'transparent',fontSize:13,color:'#666',borderRadius:6,cursor:'pointer'},
  toggleActive: {background:'#fff',color:'#333',fontWeight:600,boxShadow:'0 1px 4px rgba(0,0,0,0.1)'},
  field:        {marginBottom:14},
  label:        {display:'block',fontSize:11,fontWeight:600,color:'#666',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4},
  input:        {width:'100%',padding:'10px 12px',border:'1px solid #ddd',borderRadius:8,fontSize:14,boxSizing:'border-box'},
  error:        {background:'#FCEBEB',color:'#791F1F',padding:'10px 12px',borderRadius:8,fontSize:13,marginBottom:14},
  btn:          {width:'100%',padding:12,background:'#1D9E75',color:'#fff',border:'none',borderRadius:8,fontSize:15,fontWeight:600,cursor:'pointer'},
  hint:         {marginTop:20,fontSize:12,color:'#aaa',textAlign:'center'},
  screen:       {minHeight:'100vh',display:'flex',flexDirection:'column',background:'#f5f5f5',maxWidth:600,margin:'0 auto'},
  header:       {background:'#1D9E75',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'},
  headerTitle:  {fontSize:17,fontWeight:600,color:'#fff'},
  headerSub:    {fontSize:12,color:'rgba(255,255,255,0.75)',marginTop:2},
  logoutBtn:    {background:'rgba(255,255,255,0.2)',border:'none',color:'#fff',fontSize:12,borderRadius:6,padding:'5px 10px',cursor:'pointer'},
  body:         {flex:1,padding:16},
  sectionLabel: {fontSize:10,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10},
  emptyCard:    {background:'#fff',borderRadius:10,padding:40,textAlign:'center'},
  emptyIcon:    {fontSize:32,color:'#ddd',marginBottom:12},
  emptyTitle:   {fontSize:14,fontWeight:600,color:'#333',marginBottom:6},
  emptySub:     {fontSize:13,color:'#888'},
  deliveryCard: {background:'#fff',borderRadius:10,padding:16,marginBottom:12},
  deliveryHeader:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10},
  statusBadge:  {fontSize:12,fontWeight:600,padding:'4px 10px',borderRadius:20},
  urgentBadge:  {background:'#FCEBEB',color:'#791F1F',fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:10},
  drugName:     {fontSize:15,fontWeight:600,color:'#333',marginBottom:4},
  rxId:         {fontSize:11,color:'#888',fontFamily:'monospace',marginBottom:8},
  deliveredAt:  {fontSize:12,color:'#1D9E75',marginBottom:12},
  inTransitMsg: {display:'flex',alignItems:'center',gap:8,fontSize:12,color:'#BA7517',marginBottom:12},
  pulsingDot:   {width:8,height:8,borderRadius:'50%',background:'#BA7517'},
  pickedUpMsg:  {fontSize:12,color:'#0C447C',marginBottom:12},
  pendingMsg:   {fontSize:12,color:'#888',marginBottom:12},
  timeline:     {borderTop:'1px solid #f0f0f0',paddingTop:12,display:'flex',flexDirection:'column',gap:8},
  timelineStep: {display:'flex',alignItems:'center',gap:10},
  timelineDot:  {width:10,height:10,borderRadius:'50%',flexShrink:0},
  timelineLabel:{fontSize:12,color:'#666'},
  footer:       {textAlign:'center',fontSize:11,color:'#bbb',padding:'20px 0'},
}
