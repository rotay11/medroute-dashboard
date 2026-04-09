import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://cozy-upliftment-production-7486.up.railway.app'

export default function FacilityPortal() {
  const [step, setStep] = useState('login')
  const [pharmacy, setPharmacy] = useState({ name: pharmacy.name, phone: pharmacy.phone })
  const [facilities, setFacilities] = useState([])
  const [form, setForm] = useState({ facilityId: '', role: '', firstName: '', lastName: '', dob: '' })
  const [nurseAck, setNurseAck] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    axios.get(API + '/api/auth/pharmacy').then(r => { if (r.data.pharmacy) setPharmacy(r.data.pharmacy) }).catch(() => {})
    axios.get(API + '/api/portal/facilities')
      .then(r => setFacilities(r.data.facilities || []))
      .catch(() => {})
  }, [])

  function update(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  async function handleLookup() {
    if (!form.facilityId || !form.role || !form.firstName || !form.lastName || !form.dob) {
      setError('All fields are required'); return
    }
    setLoading(true); setError('')
    try {
      const { data } = await axios.post(API + '/api/portal/caregiver/lookup', {
        facilityId: form.facilityId,
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        role: form.role,
        showMeds: form.role === 'nurse' && nurseAck
      })
      setResult(data)
      setStep('result')
    } catch (err) {
      setError(err.response?.data?.error || 'Patient not found. Contact Clayworth Pharmacy at (510) 537-9402.')
    }
    setLoading(false)
  }

  const s = {
    page: { minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
    card: { background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 2px 20px rgba(0,0,0,0.08)' },
    header: { textAlign: 'center', marginBottom: 24 },
    logo: { width: 48, height: 48, background: '#1D9E75', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px' },
    title: { fontSize: 18, fontWeight: 600, color: '#333' },
    sub: { fontSize: 13, color: '#888', marginTop: 4 },
    field: { marginBottom: 14 },
    label: { display: 'block', fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' },
    btn: { width: '100%', padding: 12, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
    error: { background: '#FCEBEB', color: '#791F1F', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 },
    statusCard: { background: '#f9f9f9', borderRadius: 10, padding: 16, marginBottom: 16 },
    statusLabel: { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
    statusValue: { fontSize: 15, fontWeight: 600 },
    infoCard: { background: '#FFF8EC', borderRadius: 10, padding: 14, borderLeft: '3px solid #BA7517', marginBottom: 16 },
    backBtn: { width: '100%', padding: 10, background: '#888', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }
  }

  if (step === 'result' && result) {
    const d = result.delivery
    const statusText = d.status === 'IN_TRANSIT' ? '→ Out for delivery' :
      d.status === 'PICKED_UP' ? '📦 Picked up from pharmacy' :
      d.status === 'DELIVERED' ? '✓ Delivered' : '⏳ Being prepared'
    const statusColor = d.status === 'DELIVERED' ? '#1D9E75' : d.status === 'IN_TRANSIT' ? '#BA7517' : '#0C447C'

    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.header}>
            <div style={s.logo}>📦</div>
            <div style={s.title}>{result.patient.firstName} {result.patient.lastInitial}.</div>
            <div style={s.sub}>Delivery Status</div>
          </div>
          <div style={s.statusCard}>
            <div style={s.statusLabel}>Current Status</div>
            <div style={{ ...s.statusValue, color: statusColor }}>{statusText}</div>
            {d.itemCount > 0 && <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{d.itemCount} item{d.itemCount > 1 ? 's' : ''} on the way</div>}
            {d.driverName && <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Driver: {d.driverName}</div>}
            {d.etaMinutes && <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Estimated arrival: {d.etaMinutes} minutes</div>}
            {result.medications && result.medications.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Medications</div>
                {result.medications.map((m, i) => <div key={i} style={{ fontSize: 13, color: '#333', marginBottom: 4 }}>• {m.medication} {m.dosage}</div>)}
              </div>
            )}
          </div>
          <div style={s.infoCard}>
            <div style={{ fontSize: 12, color: '#633806' }}>For more information contact Clayworth Pharmacy</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#633806', marginTop: 4 }}>(510) 537-9402</div>
          </div>
          <button style={s.backBtn} onClick={() => { setStep('login'); setResult(null); setForm({ facilityId: '', role: '', firstName: '', lastName: '', dob: '' }); setNurseAck(false) }}>
            Check another patient
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logo}>💊</div>
          <div style={s.title}>Delivery Status</div>
          <div style={s.sub}>Clayworth Pharmacy</div>
        </div>
        <div style={s.field}>
          <label style={s.label}>Facility</label>
          <select style={s.input} value={form.facilityId} onChange={e => update('facilityId', e.target.value)}>
            <option value="">Select facility...</option>
            {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>I am a</label>
          <select style={s.input} value={form.role} onChange={e => update('role', e.target.value)}>
            <option value="">Select role...</option>
            <option value="nurse">Nurse</option>
            <option value="caregiver">Caregiver</option>
            <option value="family">Family Member</option>
          </select>
        </div>
        <div style={s.field}>
          <label style={s.label}>Patient first name</label>
          <input style={s.input} value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="First name" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Patient last name</label>
          <input style={s.input} value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Last name" />
        </div>
        <div style={s.field}>
          <label style={s.label}>Patient date of birth</label>
          <input style={s.input} type="date" value={form.dob} onChange={e => update('dob', e.target.value)} />
        </div>
        {form.role === 'nurse' && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={nurseAck} onChange={e => setNurseAck(e.target.checked)} style={{ marginTop: 2 }} />
              <span style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>I am a licensed healthcare provider authorized to view this patient's medication information</span>
            </label>
          </div>
        )}
        {error && <div style={s.error}>{error}</div>}
        <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={handleLookup} disabled={loading}>
          {loading ? 'Looking up...' : 'Check delivery status'}
        </button>
      </div>
    </div>
  )
}
