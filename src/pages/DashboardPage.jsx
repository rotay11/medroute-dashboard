import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const API = 'https://cozy-upliftment-production-7486.up.railway.app'

function getToken() { return localStorage.getItem('dispatcher_token') }

function LiveMap({ drivers, liveLocations }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    if (!mapRef.current) return
    if (mapInstanceRef.current) return

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    function initLeaflet() {
      if (!window.L) { setTimeout(initLeaflet, 300); return }
      if (mapInstanceRef.current) return
      const map = window.L.map(mapRef.current).setView([37.6879, -122.0561], 13)
      mapInstanceRef.current = map
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)
      const icon = window.L.divIcon({
        className: '',
        html: '<div style="background:#1D9E75;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
        iconSize: [16, 16], iconAnchor: [8, 8],
      })
      window.L.marker([37.6879, -122.0561], { icon }).addTo(map)
        .bindPopup('<b>' + pharmacy.name + '</b><br>' + pharmacy.address)
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script')
      script.id = 'leaflet-js'
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initLeaflet
      document.head.appendChild(script)
    } else { initLeaflet() }

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
    }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !window.L) return
    drivers.forEach(driver => {
      const loc = liveLocations[driver.id] || driver.gpsPings?.[0]
      if (!loc) return
      const lat = parseFloat(loc.lat), lng = parseFloat(loc.lng)
      if (isNaN(lat) || isNaN(lng)) return
      const color = driver.status === 'ACTIVE' ? '#1D9E75' : '#BA7517'
      const icon = window.L.divIcon({
        className: '',
        html: '<div style="background:' + color + ';width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>',
        iconSize: [14, 14], iconAnchor: [7, 7],
      })
      if (markersRef.current[driver.id]) {
        markersRef.current[driver.id].setLatLng([lat, lng])
      } else {
        const marker = window.L.marker([lat, lng], { icon }).addTo(map)
          .bindPopup('<b>' + driver.firstName + ' ' + driver.lastName + '</b><br>' + driver.driverId + '<br>' + driver.status)
        markersRef.current[driver.id] = marker
      }
    })
  }, [drivers, liveLocations])

  return (
    <div>
      <div ref={mapRef} style={{ width: '100%', height: 420, borderRadius: 10, border: '1px solid #e0e0e0', zIndex: 1 }} />
      <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, color: '#888' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D9E75' }} /><span>On route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#BA7517' }} /><span>At pharmacy / idle</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1D9E75', border: '2px solid white' }} /><span>{pharmacy.name}</span>
        </div>
      </div>
    </div>
  )
}

function AddDriverModal({ onClose, onSave, token }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    role: 'DRIVER', language: 'EN', zone: '',
    shiftType: 'Morning · 7 AM – 3 PM'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post(API + '/api/admin/drivers', form, {
        headers: { Authorization: 'Bearer ' + token }
      })
      setCreated(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create driver')
    }
    setLoading(false)
  }

  function update(field, value) { setForm(prev => ({ ...prev, [field]: value })) }

  const shifts = ['Morning · 7 AM – 3 PM', 'Afternoon · 11 AM – 7 PM', 'Evening · 3 PM – 11 PM']

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={mStyles.header}>
          <div style={mStyles.title}>Add new staff member</div>
          <button style={mStyles.closeBtn} onClick={onClose}>x</button>
        </div>
        {created ? (
          <div style={mStyles.body}>
            <div style={mStyles.successBox}>
              <div style={mStyles.successTitle}>Driver account created!</div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Name</span><span>{created.driver.firstName} {created.driver.lastName}</span></div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Driver ID</span><span style={{ fontFamily: 'monospace' }}>{created.driver.driverId}</span></div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Email</span><span>{created.driver.email}</span></div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Temp password</span><span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1D9E75' }}>{created.tempPassword}</span></div>
              <div style={mStyles.successNote}>Share these credentials with the driver. They can log in with this temporary password.</div>
            </div>
            <div style={mStyles.footer}>
              <button style={mStyles.primaryBtn} onClick={() => { onSave(); onClose() }}>Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={mStyles.body}>
              <div style={mStyles.section}>Personal information</div>
              <div style={mStyles.grid2}>
                <div style={mStyles.field}>
                  <label style={mStyles.label}>First name</label>
                  <input style={mStyles.input} value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Maria" required />
                </div>
                <div style={mStyles.field}>
                  <label style={mStyles.label}>Last name</label>
                  <input style={mStyles.input} value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Gonzalez" required />
                </div>
                <div style={mStyles.field}>
                  <label style={mStyles.label}>Email address</label>
                  <input style={mStyles.input} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="driver@medroute.com" required />
                </div>
                <div style={mStyles.field}>
                  <label style={mStyles.label}>Mobile number</label>
                  <input style={mStyles.input} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 000-0000" required />
                </div>
              </div>
              <div style={mStyles.section}>Account settings</div>
              <div style={mStyles.grid3}>
                <div style={mStyles.field}>
                  <label style={mStyles.label}>Role</label>
                  <select style={mStyles.input} value={form.role} onChange={e => update('role', e.target.value)}>
                    <option value="DRIVER">Driver</option>
                    <option value="DISPATCHER">Dispatcher</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div style={mStyles.field}>
                  <label style={mStyles.label}>Language</label>
                  <select style={mStyles.input} value={form.language} onChange={e => update('language', e.target.value)}>
                    <option value="EN">English</option>
                    <option value="ES">Español</option>
                  </select>
                </div>
                <div style={mStyles.field}>
                  <label style={mStyles.label}>Zone</label>
                  <input style={mStyles.input} value={form.zone} onChange={e => update('zone', e.target.value)} placeholder="e.g. Castro Valley" required />
                </div>
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Zip codes (comma separated)</label>
                <input style={mStyles.input} value={form.zipCodes} onChange={e => update('zipCodes', e.target.value)} placeholder="94546, 94552, 94578" />
                <div style={{fontSize:10,color:'#888',marginTop:3}}>Deliveries in these zip codes auto-assign to this driver</div>
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Shift</label>
                <select style={mStyles.input} value={form.shiftType} onChange={e => update('shiftType', e.target.value)}>
                  {shifts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {error && <div style={mStyles.error}>{error}</div>}
            </div>
            <div style={mStyles.footer}>
              <button type="button" style={mStyles.secondaryBtn} onClick={onClose}>Cancel</button>
              <button type="submit" style={mStyles.primaryBtn} disabled={loading}>
                {loading ? 'Creating...' : 'Create driver account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

const mStyles = {
  overlay:      { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modal:        { background: '#fff', borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto' },
  header:       { padding: '16px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  title:        { fontSize: 15, fontWeight: 600, color: '#333' },
  closeBtn:     { padding: '4px 10px', border: '1px solid #ddd', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 13 },
  body:         { padding: '20px' },
  section:      { fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, marginTop: 16 },
  grid2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  grid3:        { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 },
  field:        { marginBottom: 4 },
  label:        { display: 'block', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 },
  input:        { width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13, color: '#333', outline: 'none', boxSizing: 'border-box' },
  error:        { background: '#FCEBEB', color: '#791F1F', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginTop: 12 },
  footer:       { padding: '14px 20px', borderTop: '1px solid #e0e0e0', display: 'flex', gap: 8, justifyContent: 'flex-end' },
  primaryBtn:   { padding: '9px 18px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  secondaryBtn: { padding: '9px 18px', background: 'transparent', color: '#666', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, cursor: 'pointer' },
  successBox:   { background: '#E1F5EE', borderRadius: 8, padding: 16, marginBottom: 16 },
  successTitle: { fontSize: 14, fontWeight: 600, color: '#085041', marginBottom: 12 },
  successRow:   { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #9FE1CB', fontSize: 13 },
  successKey:   { color: '#0F6E56', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' },
  successNote:  { fontSize: 12, color: '#0F6E56', marginTop: 10, fontStyle: 'italic' },
}

function AddPatientModal({ onClose, onSave, token }) {
  const [form, setForm] = React.useState({ firstName:'', lastName:'', email:'', phone:'', address:'', dob:'', language:'EN' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [created, setCreated] = React.useState(null)
  const API = 'https://cozy-upliftment-production-7486.up.railway.app'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(API + '/api/admin/patients', form, { headers: { Authorization: 'Bearer ' + token } })
      setCreated(data)
    } catch (err) { setError(err.response?.data?.error || 'Failed to create patient') }
    setLoading(false)
  }

  function update(f, v) { setForm(prev => ({...prev, [f]: v})) }

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={mStyles.header}>
          <div style={mStyles.title}>Add new patient</div>
          <button style={mStyles.closeBtn} onClick={onClose}>x</button>
        </div>
        {created ? (
          <div style={mStyles.body}>
            <div style={mStyles.successBox}>
              <div style={mStyles.successTitle}>Patient added!</div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Name</span><span>{created.patient.firstName} {created.patient.lastName}</span></div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Email</span><span>{created.patient.email}</span></div>
              <div style={mStyles.successNote}>Patient can now track deliveries at the portal using their email and date of birth.</div>
            </div>
            <div style={mStyles.footer}><button style={mStyles.primaryBtn} onClick={() => { onSave(); onClose() }}>Done</button></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={mStyles.body}>
              <div style={mStyles.grid2}>
                <div style={mStyles.field}><label style={mStyles.label}>First name</label><input style={mStyles.input} value={form.firstName} onChange={e=>update('firstName',e.target.value)} placeholder="John" required /></div>
                <div style={mStyles.field}><label style={mStyles.label}>Last name</label><input style={mStyles.input} value={form.lastName} onChange={e=>update('lastName',e.target.value)} placeholder="Smith" required /></div>
                <div style={mStyles.field}><label style={mStyles.label}>Email</label><input style={mStyles.input} type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="patient@email.com" required /></div>
                <div style={mStyles.field}><label style={mStyles.label}>Phone</label><input style={mStyles.input} value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="(555) 000-0000" /></div>
                <div style={mStyles.field}><label style={mStyles.label}>Date of birth</label><input style={mStyles.input} type="date" value={form.dob} onChange={e=>update('dob',e.target.value)} required /></div>
                <div style={mStyles.field}><label style={mStyles.label}>Language</label><select style={mStyles.input} value={form.language} onChange={e=>update('language',e.target.value)}><option value="EN">English</option><option value="ES">Español</option></select></div>
              </div>
              <div style={mStyles.field}><label style={mStyles.label}>Address</label><input style={mStyles.input} value={form.address} onChange={e=>update('address',e.target.value)} placeholder="123 Main St, City, CA 94546" /></div>
              {error && <div style={mStyles.error}>{error}</div>}
            </div>
            <div style={mStyles.footer}>
              <button type="button" style={mStyles.secondaryBtn} onClick={onClose}>Cancel</button>
              <button type="submit" style={mStyles.primaryBtn} disabled={loading}>{loading?'Adding...':'Add patient'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function AddFacilityModal({ onClose, onSave, token }) {
  const [form, setForm] = React.useState({ name:'', email:'', phone:'', address:'', contactPerson:'', password:'' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [created, setCreated] = React.useState(null)
  const API = 'https://cozy-upliftment-production-7486.up.railway.app'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(API + '/api/admin/facilities', form, { headers: { Authorization: 'Bearer ' + token } })
      setCreated(data)
    } catch (err) { setError(err.response?.data?.error || 'Failed to create facility') }
    setLoading(false)
  }

  function update(f, v) { setForm(prev => ({...prev, [f]: v})) }

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={mStyles.header}>
          <div style={mStyles.title}>Add new facility</div>
          <button style={mStyles.closeBtn} onClick={onClose}>x</button>
        </div>
        {created ? (
          <div style={mStyles.body}>
            <div style={mStyles.successBox}>
              <div style={mStyles.successTitle}>Facility added!</div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Name</span><span>{created.facility.name}</span></div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Email</span><span>{created.facility.email}</span></div>
              <div style={mStyles.successNote}>Facility can now log into the portal to track all their deliveries.</div>
            </div>
            <div style={mStyles.footer}><button style={mStyles.primaryBtn} onClick={() => { onSave(); onClose() }}>Done</button></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={mStyles.body}>
              <div style={mStyles.grid2}>
                <div style={mStyles.field}><label style={mStyles.label}>Facility name</label><input style={mStyles.input} value={form.name} onChange={e=>update('name',e.target.value)} placeholder="St. Luke's Hospital" required /></div>
                <div style={mStyles.field}><label style={mStyles.label}>Contact person</label><input style={mStyles.input} value={form.contactPerson} onChange={e=>update('contactPerson',e.target.value)} placeholder="Dr. Jane Smith" /></div>
                <div style={mStyles.field}><label style={mStyles.label}>Email</label><input style={mStyles.input} type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="facility@hospital.com" required /></div>
                <div style={mStyles.field}><label style={mStyles.label}>Phone</label><input style={mStyles.input} value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="(555) 000-0000" /></div>
              </div>
              <div style={mStyles.field}><label style={mStyles.label}>Address</label><input style={mStyles.input} value={form.address} onChange={e=>update('address',e.target.value)} placeholder="123 Hospital Blvd, City, CA" /></div>
              <div style={mStyles.field}><label style={mStyles.label}>Portal password</label><input style={mStyles.input} type="password" value={form.password} onChange={e=>update('password',e.target.value)} placeholder="Set a password for portal access" required /></div>
              {error && <div style={mStyles.error}>{error}</div>}
            </div>
            <div style={mStyles.footer}>
              <button type="button" style={mStyles.secondaryBtn} onClick={onClose}>Cancel</button>
              <button type="submit" style={mStyles.primaryBtn} disabled={loading}>{loading?'Adding...':'Add facility'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


function DelayNotificationModal({ pkg, onClose, onSave, token }) {
  const [reason, setReason] = React.useState('')
  const [notes,  setNotes]  = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error,   setError]   = React.useState('')
  const [sent,    setSent]    = React.useState(false)
  const API = 'https://cozy-upliftment-production-7486.up.railway.app'

  const reasons = [
    { value: 'medication_on_order',      label: 'Medication on order' },
    { value: 'medication_partly_filled', label: 'Medication partially filled' },
    { value: 'insurance_not_covered',    label: 'Medication not covered by insurance — doctor notified' },
    { value: 'delivery_rescheduled',     label: 'Delivery rescheduled — please contact pharmacy' },
    { value: 'weather_traffic_delay',    label: 'Weather or traffic delay' },
  ]

  async function handleSubmit(e) {
    e.preventDefault()
    if (!reason) { setError('Please select a reason'); return }
    setLoading(true); setError('')
    try {
      await axios.post(API + '/api/dispatch/packages/' + pkg.id + '/notify-delay',
        { reason, notes },
        { headers: { Authorization: 'Bearer ' + token } }
      )
      setSent(true)
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send notification')
    }
    setLoading(false)
  }

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={mStyles.header}>
          <div style={mStyles.title}>Notify delay</div>
          <button style={mStyles.closeBtn} onClick={onClose}>x</button>
        </div>
        {sent ? (
          <div style={mStyles.body}>
            <div style={mStyles.successBox}>
              <div style={mStyles.successTitle}>Notification sent</div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Patient</span><span>{pkg.patient?.firstName} {pkg.patient?.lastName}</span></div>
              <div style={mStyles.successRow}><span style={mStyles.successKey}>Medication</span><span>{pkg.medication}</span></div>
              <div style={mStyles.successNote}>The patient has been notified by email about the delay.</div>
            </div>
            <div style={mStyles.footer}><button style={mStyles.primaryBtn} onClick={onClose}>Done</button></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={mStyles.body}>
              <div style={{background:'#f9f9f9',borderRadius:8,padding:12,marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:600,color:'#333'}}>{pkg.medication} {pkg.dosage}</div>
                <div style={{fontSize:11,color:'#888',fontFamily:'monospace',marginTop:2}}>RX: {pkg.rxId}</div>
                <div style={{fontSize:12,color:'#555',marginTop:4}}>Patient: {pkg.patient?.firstName} {pkg.patient?.lastName}</div>
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Reason for delay</label>
                <select style={mStyles.input} value={reason} onChange={e => setReason(e.target.value)} required>
                  <option value="">Select a reason...</option>
                  {reasons.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Additional notes (optional)</label>
                <textarea
                  style={{...mStyles.input, height:80, resize:'vertical'}}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any additional details for the patient..."
                />
              </div>
              {error && <div style={mStyles.error}>{error}</div>}
              <div style={{fontSize:12,color:'#888',marginTop:8}}>
                An email notification will be sent to the patient immediately.
              </div>
            </div>
            <div style={mStyles.footer}>
              <button type="button" style={mStyles.secondaryBtn} onClick={onClose}>Cancel</button>
              <button type="submit" style={{...mStyles.primaryBtn,background:'#BA7517'}} disabled={loading}>
                {loading ? 'Sending...' : 'Send notification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


function EditStaffModal({ staff, onClose, onSave, token }) {
  const [form, setForm] = React.useState({
    firstName: staff.firstName || '',
    lastName:  staff.lastName  || '',
    phone:     staff.phone     || '',
    role:      staff.role      || 'DRIVER',
    language:  staff.language  || 'EN',
    zone:      staff.zone      || '',
    zipCodes:  staff.zipCodes  || '',
    status:    staff.status    || 'ACTIVE',
  })
  const [loading, setLoading] = React.useState(false)
  const [error,   setError]   = React.useState('')
  const API = 'https://cozy-upliftment-production-7486.up.railway.app'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await axios.patch(API + '/api/admin/drivers/' + staff.id, form, {
        headers: { Authorization: 'Bearer ' + token }
      })
      onSave(); onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update staff member')
    }
    setLoading(false)
  }

  function update(f, v) { setForm(prev => ({...prev, [f]: v})) }

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={mStyles.header}>
          <div style={mStyles.title}>Edit staff member</div>
          <button style={mStyles.closeBtn} onClick={onClose}>x</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={mStyles.body}>
            <div style={mStyles.section}>Personal information</div>
            <div style={mStyles.grid2}>
              <div style={mStyles.field}>
                <label style={mStyles.label}>First name</label>
                <input style={mStyles.input} value={form.firstName} onChange={e=>update('firstName',e.target.value)} required />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Last name</label>
                <input style={mStyles.input} value={form.lastName} onChange={e=>update('lastName',e.target.value)} required />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Phone</label>
                <input style={mStyles.input} value={form.phone} onChange={e=>update('phone',e.target.value)} />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Zone</label>
                <input style={mStyles.input} value={form.zone} onChange={e=>update('zone',e.target.value)} placeholder="e.g. Castro Valley" />
              </div>
            </div>
            <div style={mStyles.field}>
              <label style={mStyles.label}>Zip codes (comma separated)</label>
              <input style={mStyles.input} value={form.zipCodes} onChange={e=>update('zipCodes',e.target.value)} placeholder="94546, 94552, 94578" />
              <div style={{fontSize:10,color:'#888',marginTop:3}}>Deliveries in these zip codes will be automatically assigned to this driver</div>
            </div>
            <div style={mStyles.section}>Account settings</div>
            <div style={mStyles.grid3}>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Role</label>
                <select style={mStyles.input} value={form.role} onChange={e=>update('role',e.target.value)}>
                  <option value="DRIVER">Driver</option>
                  <option value="DISPATCHER">Dispatcher</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Language</label>
                <select style={mStyles.input} value={form.language} onChange={e=>update('language',e.target.value)}>
                  <option value="EN">English</option>
                  <option value="ES">Español</option>
                </select>
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Status</label>
                <select style={mStyles.input} value={form.status} onChange={e=>update('status',e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="IDLE">Idle</option>
                  <option value="OFFLINE">Offline</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
            {error && <div style={mStyles.error}>{error}</div>}
          </div>
          <div style={mStyles.footer}>
            <button type="button" style={mStyles.secondaryBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={mStyles.primaryBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


function ChangePasswordModal({ onClose, token }) {
  const [current, setCurrent] = React.useState('')
  const [newPwd, setNewPwd] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState(false)
  const API = 'https://cozy-upliftment-production-7486.up.railway.app'

  async function handleSubmit(e) {
    e.preventDefault()
    if (newPwd !== confirm) { setError('New passwords do not match'); return }
    if (newPwd.length < 8) { setError('New password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      await axios.post(API + '/api/auth/change-password', { currentPassword: current, newPassword: newPwd }, {
        headers: { Authorization: 'Bearer ' + token }
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not change password')
    }
    setLoading(false)
  }

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={mStyles.header}>
          <div style={mStyles.title}>Change password</div>
          <button style={mStyles.closeBtn} onClick={onClose}>x</button>
        </div>
        {success ? (
          <div style={mStyles.body}>
            <div style={mStyles.successBox}>
              <div style={mStyles.successTitle}>Password changed successfully</div>
            </div>
            <div style={mStyles.footer}>
              <button style={mStyles.primaryBtn} onClick={onClose}>Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={mStyles.body}>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Current password</label>
                <input style={mStyles.input} type="password" value={current} onChange={e=>setCurrent(e.target.value)} required />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>New password</label>
                <input style={mStyles.input} type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="At least 8 characters" required />
              </div>
              <div style={mStyles.field}>
                <label style={mStyles.label}>Confirm new password</label>
                <input style={mStyles.input} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
              </div>
              {error && <div style={mStyles.error}>{error}</div>}
            </div>
            <div style={mStyles.footer}>
              <button type="button" style={mStyles.secondaryBtn} onClick={onClose}>Cancel</button>
              <button type="submit" style={mStyles.primaryBtn} disabled={loading}>{loading ? 'Saving...' : 'Change password'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


function EditPatientModal({ patient, onClose, onSave, token }) {
  const [form, setForm] = React.useState({
    firstName: patient.firstName || '',
    lastName:  patient.lastName  || '',
    email:     patient.email     || '',
    phone:     patient.phone     || '',
    address:   patient.address   || '',
    language:  patient.language  || 'EN',
  })
  const [loading, setLoading] = React.useState(false)
  const [error,   setError]   = React.useState('')
  const API = 'https://cozy-upliftment-production-7486.up.railway.app'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await axios.patch(API + '/api/admin/patients/' + patient.id, form, { headers: { Authorization: 'Bearer ' + token } })
      onSave(); onClose()
    } catch (err) { setError(err.response?.data?.error || 'Failed to update patient') }
    setLoading(false)
  }

  function update(f, v) { setForm(prev => ({...prev, [f]: v})) }

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={mStyles.header}>
          <div style={mStyles.title}>Edit patient</div>
          <button style={mStyles.closeBtn} onClick={onClose}>x</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={mStyles.body}>
            <div style={mStyles.grid2}>
              <div style={mStyles.field}><label style={mStyles.label}>First name</label><input style={mStyles.input} value={form.firstName} onChange={e=>update('firstName',e.target.value)} required /></div>
              <div style={mStyles.field}><label style={mStyles.label}>Last name</label><input style={mStyles.input} value={form.lastName} onChange={e=>update('lastName',e.target.value)} required /></div>
              <div style={mStyles.field}><label style={mStyles.label}>Email</label><input style={mStyles.input} type="email" value={form.email} onChange={e=>update('email',e.target.value)} required /></div>
              <div style={mStyles.field}><label style={mStyles.label}>Phone</label><input style={mStyles.input} value={form.phone} onChange={e=>update('phone',e.target.value)} /></div>
              <div style={mStyles.field}><label style={mStyles.label}>Language</label><select style={mStyles.input} value={form.language} onChange={e=>update('language',e.target.value)}><option value="EN">English</option><option value="ES">Español</option></select></div>
            </div>
            <div style={mStyles.field}><label style={mStyles.label}>Address</label><input style={mStyles.input} value={form.address} onChange={e=>update('address',e.target.value)} /></div>
            {error && <div style={mStyles.error}>{error}</div>}
          </div>
          <div style={mStyles.footer}>
            <button type="button" style={mStyles.secondaryBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={mStyles.primaryBtn} disabled={loading}>{loading?'Saving...':'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditFacilityModal({ facility, onClose, onSave, token }) {
  const [form, setForm] = React.useState({
    name:          facility.name          || '',
    email:         facility.email         || '',
    phone:         facility.phone         || '',
    address:       facility.address       || '',
    contactPerson: facility.contactPerson || '',
  })
  const [loading, setLoading] = React.useState(false)
  const [error,   setError]   = React.useState('')
  const API = 'https://cozy-upliftment-production-7486.up.railway.app'

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await axios.patch(API + '/api/admin/facilities/' + facility.id, form, { headers: { Authorization: 'Bearer ' + token } })
      onSave(); onClose()
    } catch (err) { setError(err.response?.data?.error || 'Failed to update facility') }
    setLoading(false)
  }

  function update(f, v) { setForm(prev => ({...prev, [f]: v})) }

  return (
    <div style={mStyles.overlay} onClick={onClose}>
      <div style={mStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={mStyles.header}>
          <div style={mStyles.title}>Edit facility</div>
          <button style={mStyles.closeBtn} onClick={onClose}>x</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={mStyles.body}>
            <div style={mStyles.grid2}>
              <div style={mStyles.field}><label style={mStyles.label}>Facility name</label><input style={mStyles.input} value={form.name} onChange={e=>update('name',e.target.value)} required /></div>
              <div style={mStyles.field}><label style={mStyles.label}>Contact person</label><input style={mStyles.input} value={form.contactPerson} onChange={e=>update('contactPerson',e.target.value)} /></div>
              <div style={mStyles.field}><label style={mStyles.label}>Email</label><input style={mStyles.input} type="email" value={form.email} onChange={e=>update('email',e.target.value)} required /></div>
              <div style={mStyles.field}><label style={mStyles.label}>Phone</label><input style={mStyles.input} value={form.phone} onChange={e=>update('phone',e.target.value)} /></div>
            </div>
            <div style={mStyles.field}><label style={mStyles.label}>Address</label><input style={mStyles.input} value={form.address} onChange={e=>update('address',e.target.value)} /></div>
            {error && <div style={mStyles.error}>{error}</div>}
          </div>
          <div style={mStyles.footer}>
            <button type="button" style={mStyles.secondaryBtn} onClick={onClose}>Cancel</button>
            <button type="submit" style={mStyles.primaryBtn} disabled={loading}>{loading?'Saving...':'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}


function statusStyle(status) {
  if (status === 'ACTIVE')    return { background: '#E1F5EE', color: '#085041' }
  if (status === 'IDLE')      return { background: '#F1EFE8', color: '#444441' }
  if (status === 'SUSPENDED') return { background: '#FCEBEB', color: '#791F1F' }
  return { background: '#f0f0f0', color: '#666' }
}

function pkgStatusStyle(status) {
  if (status === 'DELIVERED')  return { background: '#E1F5EE', color: '#085041' }
  if (status === 'PICKED_UP')  return { background: '#E6F1FB', color: '#0C447C' }
  if (status === 'IN_TRANSIT') return { background: '#FAEEDA', color: '#633806' }
  if (status === 'FAILED')     return { background: '#FCEBEB', color: '#791F1F' }
  return { background: '#f0f0f0', color: '#666' }
}

export default function DashboardPage({ user, onLogout }) {
  const [drivers,        setDrivers]        = useState([])
  const [pharmacy,       setPharmacy]       = useState({ name: 'Clayworth Pharmacy', address: '20353 Lake Chabot Rd, Castro Valley CA', phone: '(510) 537-9402' })
  const [packages,       setPackages]       = useState([])
  const [alerts,         setAlerts]         = useState([])
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [activeTab,      setActiveTab]      = useState('map')
  const [liveLocations,  setLiveLocations]  = useState({})
  const [showAddDriver,  setShowAddDriver]  = useState(false)
  const [roleFilter,     setRoleFilter]     = useState('ALL')
  const [patients,       setPatients]       = useState([])
  const [facilities,     setFacilities]     = useState([])
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showAddFacility,setShowAddFacility]= useState(false)
  const [editPatient,    setEditPatient]    = useState(null)
  const [editFacility,   setEditFacility]   = useState(null)
  const [editStaff,      setEditStaff]      = useState(null)
  const [delayPackage,   setDelayPackage]   = useState(null)
  const [showChangePwd,  setShowChangePwd]  = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    loadDrivers()
    loadPackages()
    axios.get(API + '/api/auth/pharmacy').then(r => { if (r.data.pharmacy) setPharmacy(r.data.pharmacy) }).catch(() => {})
    loadAlerts()
    loadPatients()
    loadFacilities()

    const socket = io(API, { auth: { token: getToken() } })
    socketRef.current = socket

    socket.on('driver_location', (data) => {
      setLiveLocations(prev => ({ ...prev, [data.driverId]: { lat: data.lat, lng: data.lng, timestamp: data.timestamp } }))
      setDrivers(prev => prev.map(d => d.id === data.driverId ? { ...d, lastLocation: data } : d))
    })
    socket.on('delivery_confirmed', () => { loadPackages(); loadDrivers() })
    socket.on('package_scanned',    () => { loadPackages() })
    socket.on('alert', (alert) => { setAlerts(prev => [{ ...alert, id: Date.now() }, ...prev].slice(0, 20)) })

    const interval = setInterval(() => { loadDrivers(); loadPackages() }, 30000)
    return () => { socket.disconnect(); clearInterval(interval) }
  }, [])

  async function loadDrivers() {
    try {
      const { data } = await axios.get(API + '/api/dispatch/drivers', { headers: { Authorization: 'Bearer ' + getToken() } })
      setDrivers(data.drivers || [])
    } catch {}
  }

  async function loadPackages() {
    try {
      const { data } = await axios.get(API + '/api/dispatch/packages', { headers: { Authorization: 'Bearer ' + getToken() } })
      setPackages(data.packages || [])
    } catch {}
  }

  async function loadAlerts() {
    try {
      const { data } = await axios.get(API + '/api/dispatch/alerts', { headers: { Authorization: 'Bearer ' + getToken() } })
      setAlerts(data.alerts || [])
    } catch {}
  }

  const filteredDrivers = roleFilter === 'ALL' ? drivers : drivers.filter(d => d.role === roleFilter)
  async function loadPatients() {
    try {
      const { data } = await axios.get(API + '/api/admin/patients', { headers: { Authorization: 'Bearer ' + getToken() } })
      setPatients(data.patients || [])
    } catch {}
  }

  async function loadFacilities() {
    try {
      const { data } = await axios.get(API + '/api/admin/facilities', { headers: { Authorization: 'Bearer ' + getToken() } })
      setFacilities(data.facilities || [])
    } catch {}
  }


  async function handleAlertAction(alertId, action) {
    try {
      await axios.patch(API + '/api/dispatch/alerts/' + alertId + '/' + action, {}, {
        headers: { Authorization: 'Bearer ' + getToken() }
      })
      loadAlerts()
    } catch (err) {
      alert('Could not ' + action + ' alert')
    }
  }

  async function handleSuspend(driver) {
    const action = driver.status === 'SUSPENDED' ? 'restore' : 'suspend'
    if (!window.confirm(action.charAt(0).toUpperCase() + action.slice(1) + ' ' + driver.firstName + ' ' + driver.lastName + '?')) return
    try {
      await axios.patch(API + '/api/admin/drivers/' + driver.id,
        { status: driver.status === 'SUSPENDED' ? 'OFFLINE' : 'SUSPENDED' },
        { headers: { Authorization: 'Bearer ' + getToken() } }
      )
      loadDrivers()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update driver')
    }
  }

  const activeDrivers   = drivers.filter(d => d.status === 'ACTIVE')
  const idleDrivers     = drivers.filter(d => d.status === 'IDLE')
  const pendingPackages = packages.filter(p => p.status === 'PENDING' || p.status === 'PICKED_UP')
  const deliveredToday  = packages.filter(p => p.status === 'DELIVERED')
  const openAlerts      = alerts.filter(a => a.status === 'OPEN' || a.type)

  return (
    <div style={styles.shell}>
      <div style={styles.topbar}>
        <div style={styles.tbLeft}>
          <div style={styles.tbLogo}>M</div>
          <span style={styles.tbBrand}>MedRouteRx Dispatcher</span>
          <div style={styles.liveDot} />
          <span style={styles.liveText}>Live</span>
        </div>
        <div style={styles.tbRight}>
          <span style={styles.tbUser}>{user.firstName} {user.lastName} · {user.role}</span>
          <button style={{...styles.logoutBtn, marginRight:8, background:'rgba(255,255,255,0.15)'}} onClick={() => setShowChangePwd(true)}>🔑 Change password</button>
          <button style={styles.logoutBtn} onClick={onLogout}>Sign out</button>
        </div>
      </div>

      <div style={styles.statsBar}>
        <div style={styles.stat}><div style={{ ...styles.statNum, color: '#1D9E75' }}>{activeDrivers.length}</div><div style={styles.statLabel}>On route</div></div>
        <div style={styles.stat}><div style={{ ...styles.statNum, color: '#BA7517' }}>{idleDrivers.length}</div><div style={styles.statLabel}>At pharmacy</div></div>
        <div style={styles.stat}><div style={styles.statNum}>{pendingPackages.length}</div><div style={styles.statLabel}>In transit</div></div>
        <div style={styles.stat}><div style={{ ...styles.statNum, color: '#1D9E75' }}>{deliveredToday.length}</div><div style={styles.statLabel}>Delivered today</div></div>
        <div style={styles.stat}><div style={{ ...styles.statNum, color: openAlerts.length > 0 ? '#E24B4A' : '#333' }}>{openAlerts.length}</div><div style={styles.statLabel}>Open alerts</div></div>
      </div>

      <div style={{ ...styles.tabs, justifyContent: 'space-between', alignItems: 'center', paddingRight: 16 }}>
        <div style={{ display: 'flex' }}>
          {['map','drivers','patients','facilities','packages','alerts'].map(tab => (
            <button key={tab} style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'alerts' && openAlerts.length > 0 && <span style={styles.tabBadge}>{openAlerts.length}</span>}
            </button>
          ))}
        </div>
        {activeTab === 'drivers' && (
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            {['ALL','DRIVER','DISPATCHER','SUPERVISOR','ADMIN'].map(r => (
              <button key={r} style={{...styles.filterBtn,...(roleFilter===r?styles.filterBtnActive:{})}} onClick={()=>setRoleFilter(r)}>{r==='ALL'?'All':r.charAt(0)+r.slice(1).toLowerCase()}</button>
            ))}
            <button style={{...styles.addBtn,marginLeft:8}} onClick={() => setShowAddDriver(true)}>+ Add staff</button>
          </div>
        )}
      </div>

      <div style={styles.content}>
        {activeTab === 'map' && (
          <LiveMap drivers={drivers} liveLocations={liveLocations} />
        )}

        {activeTab === 'drivers' && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>{['Driver','Status','Zone','Zip codes','Language','Active stops','Last location','Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filteredDrivers.length === 0 && <tr><td colSpan={7} style={styles.empty}>No staff found</td></tr>}
                {filteredDrivers.map(driver => {
                  const loc = liveLocations[driver.id] || driver.gpsPings?.[0]
                  return (
                    <tr key={driver.id} style={styles.tr}>
                      <td style={styles.td}>
                        <div style={styles.driverCell}>
                          <div style={styles.avatar}>{driver.firstName?.[0]}{driver.lastName?.[0]}</div>
                          <div><div style={styles.driverName}>{driver.firstName} {driver.lastName}</div><div style={styles.driverId}>{driver.driverId}</div></div>
                        </div>
                      </td>
                      <td style={styles.td}><span style={{ ...styles.pill, ...statusStyle(driver.status) }}>{driver.status}</span></td>
                      <td style={styles.td}><span style={styles.zone}>{driver.zone}</span></td>
                      <td style={styles.td}><span style={{fontSize:11,color:'#888',fontFamily:'monospace'}}>{driver.zipCodes || '—'}</span></td>
                      <td style={styles.td}><span style={{ ...styles.pill, ...(driver.language === 'ES' ? styles.pillES : styles.pillEN) }}>{driver.language}</span></td>
                      <td style={styles.td}>{driver.activeStops || 0} stops</td>
                      <td style={styles.td}>
                        {loc ? (
                          <a href={'https://www.google.com/maps?q=' + loc.lat + ',' + loc.lng} target="_blank" style={styles.mapLink}>
                            {loc.lat?.toFixed(4)}, {loc.lng?.toFixed(4)}
                          </a>
                        ) : <span style={{ color: '#aaa' }}>No data</span>}
                      </td>
                      <td style={styles.td}>
                        <div style={{display:'flex',gap:4}}>
                          <button style={styles.actionBtn} onClick={() => setSelectedDriver(driver)}>View</button>
                          <button style={{...styles.actionBtn,color:'#0C447C',borderColor:'#0C447C'}} onClick={() => setEditStaff(driver)}>Edit</button>
                          <button style={{...styles.actionBtn,color:'#BA7517',borderColor:'#BA7517'}} onClick={async () => {
                            if (!window.confirm('Clear all undelivered stops for ' + driver.firstName + ' ' + driver.lastName + '?')) return
                            try {
                              await axios.post(API + '/api/dispatch/drivers/' + driver.id + '/clear-route', {}, { headers: { Authorization: 'Bearer ' + getToken() } })
                              alert('Route cleared successfully')
                              loadDrivers()
                              loadPackages()
                            } catch (err) {
                              alert('Could not clear route')
                            }
                          }}>Clear Route</button>
                          <button style={{...styles.actionBtn,color:driver.status==='SUSPENDED'?'#1D9E75':'#E24B4A',borderColor:driver.status==='SUSPENDED'?'#1D9E75':'#E24B4A'}} onClick={() => handleSuspend(driver)}>{driver.status==='SUSPENDED'?'Restore':'Suspend'}</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'patients' && (
          <div style={styles.tableWrap}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid #e0e0e0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,fontWeight:600,color:'#333'}}>Patients</span>
              <button style={styles.addBtn} onClick={() => setShowAddPatient(true)}>+ Add patient</button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>{['Name','Email','Phone','Language','Packages','Portal link'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {patients.length === 0 && <tr><td colSpan={6} style={styles.empty}>No patients found</td></tr>}
                {patients.map(patient => (
                  <tr key={patient.id} style={styles.tr}>
                    <td style={styles.td}><div style={styles.driverName}>{patient.firstName} {patient.lastName}</div></td>
                    <td style={styles.td}>{patient.email}</td>
                    <td style={styles.td}>{patient.phone || '—'}</td>
                    <td style={styles.td}><span style={{...styles.pill,...(patient.language==='ES'?styles.pillES:styles.pillEN)}}>{patient.language}</span></td>
                    <td style={styles.td}>{patient._count?.packages || 0}</td>
                    <td style={styles.td}><a href={'/portal'} target="_blank" style={styles.mapLink}>Portal</a></td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn} onClick={() => setEditPatient(patient)}>Edit</button>
                      <button style={{...styles.actionBtn, color:'#c0392b', borderColor:'#c0392b', marginLeft:4}} onClick={async () => {
                        if (!window.confirm('Delete patient ' + patient.firstName + ' ' + patient.lastName + '? This will also delete all their deliveries.')) return
                        try {
                          await axios.delete(API + '/api/admin/patients/' + patient.id, { headers: { Authorization: 'Bearer ' + getToken() } })
                          loadPatients()
                        } catch (err) {
                          alert('Could not delete patient')
                        }
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div style={styles.tableWrap}>
            <div style={{padding:'12px 16px',borderBottom:'1px solid #e0e0e0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:13,fontWeight:600,color:'#333'}}>Facilities</span>
              <button style={styles.addBtn} onClick={() => setShowAddFacility(true)}>+ Add facility</button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>{['Facility name','Email','Phone','Contact','Packages'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {facilities.length === 0 && <tr><td colSpan={5} style={styles.empty}>No facilities found</td></tr>}
                {facilities.map(facility => (
                  <tr key={facility.id} style={styles.tr}>
                    <td style={styles.td}><div style={styles.driverName}>{facility.name}</div></td>
                    <td style={styles.td}>{facility.email}</td>
                    <td style={styles.td}>{facility.phone || '—'}</td>
                    <td style={styles.td}>{facility.contactPerson || '—'}</td>
                    <td style={styles.td}>{facility._count?.packages || 0}</td>
                    <td style={styles.td}><button style={styles.actionBtn} onClick={() => setEditFacility(facility)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'packages' && (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>{['RX ID','Patient','Medication','Status','Driver','Stop','Urgent','Action'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {packages.length === 0 && <tr><td colSpan={7} style={styles.empty}>No packages found</td></tr>}
                {packages.map(pkg => (
                  <tr key={pkg.id} style={styles.tr}>
                    <td style={styles.td}><span style={styles.rxId}>{pkg.rxId}</span></td>
                    <td style={styles.td}>{pkg.patient?.firstName} {pkg.patient?.lastName}</td>
                    <td style={styles.td}>{pkg.medication} {pkg.dosage}</td>
                    <td style={styles.td}><span style={{ ...styles.pill, ...pkgStatusStyle(pkg.status) }}>{pkg.status}</span></td>
                    <td style={styles.td}>{pkg.bundle?.driver ? pkg.bundle.driver.firstName + ' ' + pkg.bundle.driver.lastName : 'Unassigned'}</td>
                    <td style={styles.td}>Stop {pkg.bundle?.stopOrder || '—'}</td>
                    <td style={styles.td}>{pkg.urgent ? <span style={styles.urgentBadge}>Urgent</span> : '—'}</td>
                    <td style={styles.td}><button style={{...styles.actionBtn,color:'#BA7517',borderColor:'#BA7517',fontSize:10}} onClick={() => setDelayPackage(pkg)}>Notify delay</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div style={styles.alertsList}>
            {alerts.length === 0 && <div style={styles.empty}>No alerts</div>}
            {alerts.map((alert, i) => (
              <div key={alert.id || i} style={styles.alertCard}>
                <div style={{ ...styles.alertDot, background: alert.severity === 'HIGH' ? '#E24B4A' : '#BA7517' }} />
                <div style={styles.alertBody}>
                  <div style={styles.alertMsg}>{alert.message || alert.description}</div>
                  <div style={styles.alertMeta}>{alert.driver?.firstName} {alert.driver?.lastName} · {alert.type} · {new Date(alert.flaggedAt || alert.timestamp).toLocaleTimeString()}</div>
                </div>
                <div style={{display:'flex',gap:4,alignItems:'center'}}>
                  <span style={{ ...styles.pill, ...(alert.status === 'OPEN' ? styles.pillAlert : styles.pillResolved) }}>{alert.status || 'New'}</span>
                  {(alert.status === 'OPEN' || !alert.status) && (
                    <React.Fragment>
                      <button style={{...styles.actionBtn,color:'#1D9E75',borderColor:'#1D9E75',fontSize:10}} onClick={() => handleAlertAction(alert.id, 'resolve')}>Resolve</button>
                      <button style={{...styles.actionBtn,color:'#888',fontSize:10}} onClick={() => handleAlertAction(alert.id, 'archive')}>Archive</button>
                    </React.Fragment>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDriver && (
        <div style={styles.modal} onClick={() => setSelectedDriver(null)}>
          <div style={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.avatar}>{selectedDriver.firstName?.[0]}{selectedDriver.lastName?.[0]}</div>
              <div><div style={styles.driverName}>{selectedDriver.firstName} {selectedDriver.lastName}</div><div style={styles.driverId}>{selectedDriver.driverId} · {selectedDriver.zone}</div></div>
              <button style={styles.closeBtn} onClick={() => setSelectedDriver(null)}>x</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalRow}><span style={styles.modalKey}>Email</span><span>{selectedDriver.email}</span></div>
              <div style={styles.modalRow}><span style={styles.modalKey}>Role</span><span>{selectedDriver.role}</span></div>
              <div style={styles.modalRow}><span style={styles.modalKey}>Language</span><span>{selectedDriver.language}</span></div>
              <div style={styles.modalRow}><span style={styles.modalKey}>Status</span><span style={{ ...styles.pill, ...statusStyle(selectedDriver.status) }}>{selectedDriver.status}</span></div>
              <div style={styles.modalRow}><span style={styles.modalKey}>Active stops</span><span>{selectedDriver.activeStops || 0}</span></div>
              <div style={styles.modalRow}><span style={styles.modalKey}>Total deliveries</span><span>{selectedDriver._count?.deliveries || 0}</span></div>
              <div style={styles.modalRow}><span style={styles.modalKey}>Discrepancies</span><span>{selectedDriver._count?.discrepancies || 0}</span></div>
            </div>
          </div>
        </div>
      )}

      {showChangePwd && (
        <ChangePasswordModal onClose={() => setShowChangePwd(false)} token={getToken()} />
      )}
      {delayPackage && (
        <DelayNotificationModal pkg={delayPackage} onClose={() => setDelayPackage(null)} onSave={loadPackages} token={getToken()} />
      )}
      {editStaff && (
        <EditStaffModal staff={editStaff} onClose={() => setEditStaff(null)} onSave={loadDrivers} token={getToken()} />
      )}
      {editPatient && (
        <EditPatientModal patient={editPatient} onClose={() => setEditPatient(null)} onSave={loadPatients} token={getToken()} />
      )}
      {editFacility && (
        <EditFacilityModal facility={editFacility} onClose={() => setEditFacility(null)} onSave={loadFacilities} token={getToken()} />
      )}
      {showAddPatient && (
        <AddPatientModal onClose={() => setShowAddPatient(false)} onSave={loadPatients} token={getToken()} />
      )}
      {showAddFacility && (
        <AddFacilityModal onClose={() => setShowAddFacility(false)} onSave={loadFacilities} token={getToken()} />
      )}
      {showAddDriver && (
        <AddDriverModal onClose={() => setShowAddDriver(false)} onSave={loadDrivers} token={getToken()} />
      )}
    </div>
  )
}

const styles = {
  shell:       { minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' },
  topbar:      { height: 52, background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 },
  tbLeft:      { display: 'flex', alignItems: 'center', gap: 10 },
  tbLogo:      { width: 28, height: 28, background: '#1D9E75', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14 },
  tbBrand:     { fontWeight: 600, fontSize: 14, color: '#333' },
  liveDot:     { width: 7, height: 7, borderRadius: '50%', background: '#1D9E75' },
  liveText:    { fontSize: 11, color: '#1D9E75', fontWeight: 600 },
  tbRight:     { display: 'flex', alignItems: 'center', gap: 12 },
  tbUser:      { fontSize: 12, color: '#888' },
  logoutBtn:   { padding: '5px 12px', border: '1px solid #ddd', borderRadius: 6, background: 'transparent', fontSize: 12, color: '#666', cursor: 'pointer' },
  statsBar:    { display: 'flex', gap: 12, padding: '14px 20px', background: '#fff', borderBottom: '1px solid #e0e0e0' },
  stat:        { flex: 1, background: '#f9f9f9', borderRadius: 8, padding: '10px 14px' },
  statNum:     { fontSize: 22, fontWeight: 600, color: '#333' },
  statLabel:   { fontSize: 10, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' },
  tabs:        { display: 'flex', gap: 2, padding: '12px 20px 0', background: '#fff', borderBottom: '1px solid #e0e0e0' },
  tab:         { padding: '8px 16px', border: 'none', background: 'transparent', fontSize: 13, color: '#888', borderBottom: '2px solid transparent', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' },
  tabActive:   { color: '#1D9E75', borderBottom: '2px solid #1D9E75', fontWeight: 600 },
  tabBadge:    { background: '#E24B4A', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 10, padding: '1px 6px' },
  filterBtn:       { padding: '5px 10px', border: '1px solid #ddd', borderRadius: 6, background: 'transparent', fontSize: 11, color: '#666', cursor: 'pointer' },
  filterBtnActive: { background: '#1D9E75', color: '#fff', borderColor: '#1D9E75' },
  addBtn:      { padding: '6px 14px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  content:     { flex: 1, padding: 20, overflow: 'auto' },
  tableWrap:   { background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0', overflow: 'hidden' },
  table:       { width: '100%', borderCollapse: 'collapse' },
  th:          { padding: '10px 14px', background: '#f9f9f9', fontSize: 10, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: 'left', borderBottom: '1px solid #e0e0e0' },
  tr:          { borderBottom: '1px solid #f0f0f0' },
  td:          { padding: '10px 14px', fontSize: 12, color: '#333', verticalAlign: 'middle' },
  empty:       { padding: 40, textAlign: 'center', color: '#aaa', fontSize: 13 },
  driverCell:  { display: 'flex', alignItems: 'center', gap: 8 },
  avatar:      { width: 30, height: 30, borderRadius: '50%', background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#085041', flexShrink: 0 },
  driverName:  { fontSize: 12, fontWeight: 600, color: '#333' },
  driverId:    { fontSize: 10, color: '#888', fontFamily: 'monospace' },
  pill:        { fontSize: 10, padding: '2px 8px', borderRadius: 10, fontWeight: 600, display: 'inline-block' },
  pillEN:      { background: '#E6F1FB', color: '#0C447C' },
  pillES:      { background: '#FAEEDA', color: '#633806' },
  pillAlert:   { background: '#FCEBEB', color: '#791F1F' },
  pillResolved:{ background: '#E1F5EE', color: '#085041' },
  zone:        { fontSize: 11, color: '#555' },
  rxId:        { fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: '#333' },
  urgentBadge: { background: '#FCEBEB', color: '#791F1F', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10 },
  mapLink:     { color: '#1D9E75', fontSize: 11, textDecoration: 'none', fontFamily: 'monospace' },
  actionBtn:   { padding: '4px 10px', border: '1px solid #ddd', borderRadius: 6, background: 'transparent', fontSize: 11, color: '#555', cursor: 'pointer' },
  alertsList:  { display: 'flex', flexDirection: 'column', gap: 8 },
  alertCard:   { background: '#fff', borderRadius: 8, padding: '12px 14px', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'flex-start', gap: 10 },
  alertDot:    { width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0 },
  alertBody:   { flex: 1 },
  alertMsg:    { fontSize: 13, fontWeight: 500, color: '#333', marginBottom: 3 },
  alertMeta:   { fontSize: 11, color: '#888' },
  modal:       { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  modalCard:   { background: '#fff', borderRadius: 12, width: '100%', maxWidth: 440, overflow: 'hidden' },
  modalHeader: { padding: '16px', background: '#f9f9f9', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 10 },
  modalBody:   { padding: 16, display: 'flex', flexDirection: 'column', gap: 0 },
  modalRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 },
  modalKey:    { color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' },
  closeBtn:    { marginLeft: 'auto', padding: '4px 10px', border: '1px solid #ddd', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 12 },
}
