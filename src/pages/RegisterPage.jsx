import React, { useState } from 'react'
import axios from 'axios'

const API = 'https://cozy-upliftment-production-7486.up.railway.app'

export default function RegisterPage() {
  const [step, setStep] = useState('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [form, setForm] = useState({
    pharmacyName: '', contactName: '', email: '', phone: '',
    address: '', licenseNumber: '', licenseState: '', password: '',
    confirmPassword: '', plan: 'BASIC', driverCount: '1-3'
  })

  function update(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post(API + '/api/register', form)
      setResult(res.data)
      setStep('success')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    }
    setLoading(false)
  }

  const planOptions = [
    { value: 'BASIC', label: 'Basic — $199/month', desc: 'Up to 3 drivers' },
    { value: 'PROFESSIONAL', label: 'Professional — $349/month', desc: 'Up to 8 drivers' },
    { value: 'ENTERPRISE', label: 'Enterprise — $499/month', desc: 'Unlimited drivers' },
  ]

  const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f0faf6 0%, #e8f5f0 50%, #f0f7ff 100%)', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: '40px 20px' },
    card: { maxWidth: 580, margin: '0 auto', background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 4px 30px rgba(0,0,0,0.08)' },
    header: { textAlign: 'center', marginBottom: 32 },
    logoWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 },
    logoIcon: { width: 44, height: 44, background: '#1D9E75', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20 },
    logoText: { fontSize: 22, fontWeight: 800, color: '#1D9E75' },
    title: { fontSize: 24, fontWeight: 700, marginBottom: 6 },
    subtitle: { fontSize: 14, color: '#888' },
    label: { fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6, display: 'block' },
    input: { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 16 },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    planCard: (selected) => ({ border: selected ? '2px solid #1D9E75' : '2px solid #eee', borderRadius: 10, padding: '12px 16px', cursor: 'pointer', marginBottom: 8, background: selected ? '#f0faf6' : '#fff', display: 'flex', alignItems: 'center', gap: 12 }),
    radio: (selected) => ({ width: 18, height: 18, borderRadius: '50%', border: selected ? '5px solid #1D9E75' : '2px solid #ddd', flexShrink: 0 }),
    btn: { width: '100%', padding: '14px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
    error: { background: '#ffeaea', color: '#791F1F', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 },
    section: { fontSize: 13, fontWeight: 700, color: '#1D9E75', marginBottom: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  }

  if (step === 'success') {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Welcome to MedRouteRx!</h2>
            <p style={{ color: '#555', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
              Your 30-day free trial has started. No credit card required.
            </p>
            <div style={{ background: '#f0faf6', borderRadius: 12, padding: 24, marginBottom: 24, textAlign: 'left' }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>YOUR DASHBOARD</div>
              <a href="https://medroute-dashboard.vercel.app" style={{ color: '#1D9E75', fontWeight: 700, fontSize: 15 }}>medroute-dashboard.vercel.app</a>
              <div style={{ fontSize: 13, color: '#888', marginTop: 16, marginBottom: 4 }}>LOGIN EMAIL</div>
              <div style={{ fontWeight: 600 }}>{result?.adminEmail}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 16, marginBottom: 4 }}>TRIAL ENDS</div>
              <div style={{ fontWeight: 600 }}>{result?.trialEndsAt ? new Date(result.trialEndsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</div>
            </div>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
              Check your email for setup instructions. Download the driver app at the link below.
            </p>
            <a href="https://medroute-dashboard.vercel.app/download" style={{ display: 'inline-block', background: '#1D9E75', color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 12 }}>
              Download Driver App
            </a>
            <br />
            <a href="https://medroute-dashboard.vercel.app" style={{ display: 'inline-block', background: '#0C447C', color: '#fff', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>M</div>
            <div style={s.logoText}>MedRouteRx</div>
          </div>
          <h1 style={s.title}>Start Your Free Trial</h1>
          <p style={s.subtitle}>30 days free. No credit card required. Cancel anytime.</p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={s.section}>Pharmacy Information</div>
          <label style={s.label}>Pharmacy Name *</label>
          <input style={s.input} type="text" placeholder="Clayworth Pharmacy" value={form.pharmacyName} onChange={e => update('pharmacyName', e.target.value)} required />

          <div style={s.row}>
            <div>
              <label style={s.label}>License Number *</label>
              <input style={s.input} type="text" placeholder="PHY12345" value={form.licenseNumber} onChange={e => update('licenseNumber', e.target.value)} required />
            </div>
            <div>
              <label style={s.label}>License State *</label>
              <input style={s.input} type="text" placeholder="CA" value={form.licenseState} onChange={e => update('licenseState', e.target.value)} required />
            </div>
          </div>

          <label style={s.label}>Pharmacy Address</label>
          <input style={s.input} type="text" placeholder="123 Main St, City, State 12345" value={form.address} onChange={e => update('address', e.target.value)} />

          <div style={s.section}>Contact Information</div>
          <label style={s.label}>Your Full Name *</label>
          <input style={s.input} type="text" placeholder="Jane Smith" value={form.contactName} onChange={e => update('contactName', e.target.value)} required />

          <div style={s.row}>
            <div>
              <label style={s.label}>Email Address *</label>
              <input style={s.input} type="email" placeholder="jane@yourpharmacy.com" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
            <div>
              <label style={s.label}>Phone Number</label>
              <input style={s.input} type="tel" placeholder="(555) 000-0000" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          </div>

          <div style={s.section}>Create Password</div>
          <div style={s.row}>
            <div>
              <label style={s.label}>Password *</label>
              <input style={s.input} type="password" placeholder="Min 8 characters" value={form.password} onChange={e => update('password', e.target.value)} required />
            </div>
            <div>
              <label style={s.label}>Confirm Password *</label>
              <input style={s.input} type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />
            </div>
          </div>

          <div style={s.section}>Choose Your Plan</div>
          {planOptions.map(p => (
            <div key={p.value} style={s.planCard(form.plan === p.value)} onClick={() => update('plan', p.value)}>
              <div style={s.radio(form.plan === p.value)} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{p.desc} · 30-day free trial</div>
              </div>
            </div>
          ))}

          <button style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Creating your account...' : 'Start Free Trial'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 12 }}>
            By registering you agree to our <a href="/terms" style={{ color: '#1D9E75' }}>Terms of Service</a> and <a href="/privacy" style={{ color: '#1D9E75' }}>Privacy Policy</a>
          </p>
        </form>
      </div>
    </div>
  )
}
