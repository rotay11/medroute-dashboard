import React, { useState } from 'react'

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ pharmacyName: '', contactName: '', email: '', phone: '', drivers: '', licenseNumber: '', licenseState: '' })
  function updateForm(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  function handleSubmit(e) {
    e.preventDefault()
    if (form.email && form.pharmacyName && form.licenseNumber) setSubmitted(true)
  }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: '#1a1a1a', overflowX: 'hidden' }}>

      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #e0e0e0', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>M</div>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1D9E75' }}>MedRouteRx</span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#features" style={{ textDecoration: 'none', color: '#555', fontSize: 14, fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" style={{ textDecoration: 'none', color: '#555', fontSize: 14, fontWeight: 500 }}>How It Works</a>
          <a href="#pricing" style={{ textDecoration: 'none', color: '#555', fontSize: 14, fontWeight: 500 }}>Pricing</a>
          <a href="#contact" style={{ textDecoration: 'none', background: '#1D9E75', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ paddingTop: 120, paddingBottom: 80, background: 'linear-gradient(135deg, #f0faf6 0%, #e8f5f0 50%, #f0f7ff 100%)', textAlign: 'center', padding: '120px 40px 80px' }}>
        <div style={{ display: 'inline-block', background: '#E8F5F0', color: '#1D9E75', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
          Built by a Licensed Pharmacist
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.15, marginBottom: 24, maxWidth: 800, margin: '0 auto 24px' }}>
          The Smarter Way to Manage<br />
          <span style={{ color: '#1D9E75' }}>Pharmacy Deliveries</span>
        </h1>
        <p style={{ fontSize: 20, color: '#555', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.7 }}>
          MedRouteRx gives independent pharmacies a complete delivery management platform — from scanning bags at pickup to real-time patient tracking and automated route optimization.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="#contact" style={{ background: '#1D9E75', color: '#fff', padding: '16px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(29,158,117,0.3)' }}>
            Start Free Trial
          </a>
          <a href="#how-it-works" style={{ background: '#fff', color: '#1D9E75', padding: '16px 36px', borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: 'none', border: '2px solid #1D9E75' }}>
            See How It Works
          </a>
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: '#888' }}>No credit card required · 30-day free trial · Cancel anytime</p>
      </section>

      {/* Stats Bar */}
      <section style={{ background: '#1D9E75', padding: '40px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}>
          {[
            { num: '20,000+', label: 'Independent Pharmacies in the US' },
            { num: '100%', label: 'HIPAA Compliant' },
            { num: 'AI', label: 'Powered Manifest Scanning' },
            { num: 'Real-Time', label: 'GPS Driver Tracking' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff' }}>{s.num}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Everything Your Pharmacy Needs</h2>
            <p style={{ fontSize: 18, color: '#666', maxWidth: 600, margin: '0 auto' }}>Built specifically for independent pharmacy delivery — not a generic delivery app.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { icon: '📦', title: 'Barcode Scanning', desc: 'Drivers scan medication bags at pickup. The system automatically builds the delivery route — no manual data entry.' },
              { icon: '🤖', title: 'AI Manifest OCR', desc: 'Photograph a paper manifest and our AI instantly reads patient name, address, and medications. New patients created in seconds.' },
              { icon: '🗺️', title: 'Smart Route Optimization', desc: 'Sort deliveries by nearest or farthest first. Drivers navigate directly from the app to Maps with one tap.' },
              { icon: '📍', title: 'Real-Time GPS Tracking', desc: 'Dispatchers see every driver on a live map. Patients track their delivery like an Uber for medications.' },
              { icon: '💬', title: 'AI Patient Assistant', desc: 'Patients ask "Where is my medication?" and get instant answers. No phone calls, no hold times.' },
              { icon: '🏥', title: 'Facility Portal', desc: 'Nurses and caregivers check delivery status for their patients. Role-based access — nurses see medication names, caregivers see ETA only.' },
              { icon: '✍️', title: 'Digital Signatures', desc: 'Capture recipient signatures and photos at delivery. Complete audit trail for every package.' },
              { icon: '🚨', title: 'Diversion Prevention', desc: 'Refused and unsigned deliveries are automatically flagged. Real-time alerts to your dispatcher.' },
              { icon: '📧', title: 'Automated Notifications', desc: 'Delay notifications sent to patients automatically. Five preset delay reasons with branded emails.' },
            ].map((f, i) => (
              <div key={i} style={{ background: '#f9f9f9', borderRadius: 16, padding: 28, border: '1px solid #eee' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 40px', background: '#f8fffe' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>How It Works</h2>
            <p style={{ fontSize: 18, color: '#666' }}>From pharmacy to patient door in four simple steps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { step: '1', icon: '📲', title: 'Scan at Pickup', desc: 'Driver scans medication barcodes. Route builds automatically.' },
              { step: '2', icon: '🚗', title: 'Navigate', desc: 'One tap opens Maps with optimized route to next delivery.' },
              { step: '3', icon: '✅', title: 'Confirm Delivery', desc: 'Capture signature, photo and recipient name at the door.' },
              { step: '4', icon: '📊', title: 'Track Everything', desc: 'Dispatcher, patient and facility all see real-time status.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 56, height: 56, background: '#1D9E75', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 20, margin: '0 auto 16px' }}>{s.step}</div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIPAA Section */}
      <section style={{ padding: '60px 40px', background: '#0C447C', color: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Built for HIPAA Compliance</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 32 }}>
            MedRouteRx was designed by a licensed pharmacist with HIPAA compliance built into every feature. Encrypted data storage, complete audit trails, role-based access controls, and Business Associate Agreements with all vendors.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: '🔐', label: 'Encrypted Database' },
              { icon: '📋', label: 'Complete Audit Logs' },
              { icon: '👥', label: 'Role-Based Access' },
              { icon: '📝', label: 'BAA Available' },
              { icon: '🏥', label: 'Built by Licensed RPh' },
              { icon: '✅', label: 'HITECH Compliant' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 40px', background: '#fff' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 16 }}>Simple, Transparent Pricing</h2>
            <p style={{ fontSize: 18, color: '#666' }}>No setup fees. No contracts. Cancel anytime.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                name: 'Basic', price: '$199', period: '/month',
                desc: 'Perfect for small pharmacies',
                features: ['Up to 3 drivers', 'Route management', 'Barcode scanning', 'Patient portal', 'AI manifest OCR', 'Email support'],
                color: '#1D9E75', highlight: false
              },
              {
                name: 'Professional', price: '$349', period: '/month',
                desc: 'Most popular for growing pharmacies',
                features: ['Up to 8 drivers', 'Everything in Basic', 'Push notifications', 'Advanced analytics', 'Facility portal', 'Priority support'],
                color: '#0C447C', highlight: true
              },
              {
                name: 'Enterprise', price: '$499', period: '/month',
                desc: 'For high-volume pharmacies',
                features: ['Unlimited drivers', 'Everything in Professional', 'Multi-location support', 'API integrations', 'Custom reporting', 'Dedicated support'],
                color: '#BA7517', highlight: false
              },
            ].map((p, i) => (
              <div key={i} style={{ borderRadius: 16, padding: 32, border: p.highlight ? `3px solid ${p.color}` : '2px solid #eee', position: 'relative', background: p.highlight ? '#f0f7ff' : '#fff' }}>
                {p.highlight && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#0C447C', color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700 }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>{p.desc}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: p.color }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: '#888' }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: 'none', marginBottom: 28 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ fontSize: 14, color: '#444', padding: '6px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: p.color, fontWeight: 700 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="#contact" style={{ display: 'block', textAlign: 'center', background: p.color, color: '#fff', padding: '12px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                  Start Free Trial
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ padding: '60px 40px', background: '#f8fffe' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, color: '#1D9E75', marginBottom: 20 }}>"</div>
          <p style={{ fontSize: 22, color: '#333', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 24 }}>
            MedRouteRx has completely transformed how we manage our delivery operation. Our drivers spend less time on paperwork and more time delivering. Our patients love being able to track their medications in real time.
          </p>
          <div style={{ fontSize: 14, color: '#888' }}>
            <strong style={{ color: '#333' }}>Clayworth Pharmacy</strong> · Castro Valley, CA · Pilot Customer
          </div>
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" style={{ padding: '80px 40px', background: '#1D9E75' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Ready to Transform Your Delivery Operation?</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 40, lineHeight: 1.6 }}>
            Join independent pharmacies using MedRouteRx to deliver smarter. Start your 30-day free trial today.
          </p>
          {submitted ? (
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 24, color: '#fff' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Thank you!</div>
              <div style={{ fontSize: 14, marginTop: 8, opacity: 0.85 }}>We will be in touch within one business day.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="text" placeholder="Pharmacy name *" value={form.pharmacyName} onChange={e => updateForm('pharmacyName', e.target.value)} required style={{ padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, outline: 'none' }} />
                <input type="text" placeholder="Your name *" value={form.contactName} onChange={e => updateForm('contactName', e.target.value)} required style={{ padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="email" placeholder="Email address *" value={form.email} onChange={e => updateForm('email', e.target.value)} required style={{ padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, outline: 'none' }} />
                <input type="tel" placeholder="Phone number" value={form.phone} onChange={e => updateForm('phone', e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="text" placeholder="Pharmacy license number *" value={form.licenseNumber} onChange={e => updateForm('licenseNumber', e.target.value)} required style={{ padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, outline: 'none' }} />
                <input type="text" placeholder="License state (e.g. CA)" value={form.licenseState} onChange={e => updateForm('licenseState', e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, outline: 'none' }} />
              </div>
              <select value={form.drivers} onChange={e => updateForm('drivers', e.target.value)} style={{ padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, outline: 'none', color: form.drivers ? '#333' : '#888' }}>
                <option value="">Number of delivery drivers</option>
                <option value="1-3">1-3 drivers (Basic plan)</option>
                <option value="4-8">4-8 drivers (Professional plan)</option>
                <option value="9+">9+ drivers (Enterprise plan)</option>
              </select>
              <button type="submit" style={{ background: '#0C447C', color: '#fff', padding: '14px 28px', borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Request Free Demo
              </button>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0 }}>* Required fields. License number used for verification purposes only.</p>
            </form>
          )}
          <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>No credit card required. 30-day free trial. Cancel anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1a1a1a', padding: '40px', color: '#888' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 32, height: 32, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>M</div>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>MedRouteRx</span>
            </div>
            <div style={{ fontSize: 12, color: '#666' }}>A Taylor Pharmacy Consulting Product</div>
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>© 2026 Taylor Pharmacy Consulting. All rights reserved.</div>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <a href="#" style={{ color: '#888', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#888', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: '#888', textDecoration: 'none' }}>HIPAA</a>
            <a href="mailto:info@medrouterx.ai" style={{ color: '#888', textDecoration: 'none' }}>Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
