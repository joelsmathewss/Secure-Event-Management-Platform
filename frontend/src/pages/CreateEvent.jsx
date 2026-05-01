import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import OtpInput from '../components/OtpInput'

const CATEGORIES = ['Music','Technology','Business','Arts & Culture','Sports & Fitness','Food & Drink','Education','Networking','Health & Wellness','Entertainment','Other']

function Field({ label, hint, children }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '7px' }}>
        <label style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{label}</label>
        {hint && <span style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>{hint}</span>}
      </div>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: '#fff', border: '1.5px solid var(--border)',
  borderRadius: '8px', color: 'var(--ink)', fontSize: '.9rem',
  outline: 'none', transition: 'border-color .15s',
}

export default function CreateEvent() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', category: '', date: '', time: '', location: '', capacity: 0, price: 0, image: '' })
  const [otp, setOtp]   = useState('')
  const [step, setStep] = useState('form')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const f = k => e => setForm({ ...form, [k]: e.target.value })
  const onFocus = e => e.target.style.borderColor = 'var(--indigo)'
  const onBlur  = e => e.target.style.borderColor = 'var(--border)'

  const sendOtp = async () => {
    if (!form.title || !form.category || !form.date || !form.location) {
      setError('Please fill in all required fields.'); return
    }
    setLoading(true); setError('')
    try { await api.post('/api/events/host/send-otp'); setStep('otp') }
    catch (err) { setError(err.response?.data?.error || 'Failed to send OTP') }
    finally { setLoading(false) }
  }

  const verifyAndPublish = async () => {
    setLoading(true); setError('')
    try {
      await api.post('/api/events/host/verify-otp', { otp })
      const { data } = await api.post('/api/events/', { ...form, publish: true })
      navigate(`/events/${data.id}`)
    } catch (err) { setError(err.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  const saveDraft = async () => {
    setLoading(true); setError('')
    try { await api.post('/api/events/', { ...form, publish: false }); navigate('/dashboard') }
    catch (err) { setError(err.response?.data?.error || 'Failed to save') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ paddingTop: 'var(--nav-h)', background: '#fff', minHeight: '100vh' }}>

      {/* Page header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--off)', padding: '40px 32px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--indigo)', marginBottom: '8px' }}>Host</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 400, letterSpacing: '-0.5px' }}>Create an event</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--ink-2)', marginTop: '8px' }}>Fill in the details below. You'll verify your email before publishing to keep our platform spam-free.</p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 32px 80px' }}>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '.85rem', color: '#dc2626', marginBottom: '28px' }}>
            {error}
          </div>
        )}

        {step === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <Field label="Event title *">
              <input style={inputStyle} value={form.title} onChange={f('title')} placeholder="Give your event a compelling name" onFocus={onFocus} onBlur={onBlur} />
            </Field>

            <Field label="Description *">
              <textarea style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} value={form.description} onChange={f('description')} placeholder="Describe what attendees can expect…" onFocus={onFocus} onBlur={onBlur} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Field label="Category *">
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.category} onChange={f('category')} onFocus={onFocus} onBlur={onBlur}>
                  <option value="">Select a category…</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Location *">
                <input style={inputStyle} value={form.location} onChange={f('location')} placeholder="Venue name or city" onFocus={onFocus} onBlur={onBlur} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Field label="Date *">
                <input style={inputStyle} type="date" value={form.date} onChange={f('date')} onFocus={onFocus} onBlur={onBlur} />
              </Field>
              <Field label="Time" hint="Optional">
                <input style={inputStyle} type="time" value={form.time} onChange={f('time')} onFocus={onFocus} onBlur={onBlur} />
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Field label="Capacity" hint="0 = unlimited">
                <input style={inputStyle} type="number" min="0" value={form.capacity} onChange={f('capacity')} onFocus={onFocus} onBlur={onBlur} />
              </Field>
              <Field label="Ticket price (₹)" hint="0 = free">
                <input style={inputStyle} type="number" min="0" step="0.01" value={form.price} onChange={f('price')} onFocus={onFocus} onBlur={onBlur} />
              </Field>
            </div>

            <Field label="Cover image URL" hint="Optional — paste a direct image link">
              <input style={inputStyle} value={form.image} onChange={f('image')} placeholder="https://…" onFocus={onFocus} onBlur={onBlur} />
            </Field>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
              <button onClick={saveDraft} disabled={loading} style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.9rem', fontWeight: 400, color: 'var(--ink-2)', cursor: 'pointer', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                Save as draft
              </button>
              <button onClick={sendOtp} disabled={loading} style={{ flex: 2, padding: '12px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '.9rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, transition: 'background .15s' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#5555d0' }}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--indigo)'}>
                {loading ? 'Sending OTP…' : 'Publish — Verify email →'}
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--off)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 400, letterSpacing: '-0.3px', marginBottom: '8px' }}>Verify your email</h2>
            <p style={{ fontSize: '.875rem', color: 'var(--ink-2)', marginBottom: '4px' }}>Enter the 6-digit code sent to your email address.</p>
            <p style={{ fontSize: '.8rem', color: 'var(--ink-3)' }}>This one-time step confirms you own the account before publishing.</p>

            <OtpInput length={6} value={otp} onChange={setOtp} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep('form')} style={{ flex: 1, padding: '12px', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.9rem', color: 'var(--ink-2)', cursor: 'pointer' }}>
                ← Back
              </button>
              <button onClick={verifyAndPublish} disabled={loading || otp.length < 6} style={{ flex: 2, padding: '12px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '.9rem', fontWeight: 500, cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer', opacity: (loading || otp.length < 6) ? .6 : 1, transition: 'background .15s' }}
                onMouseEnter={e => { if (!loading && otp.length === 6) e.currentTarget.style.background = '#5555d0' }}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--indigo)'}>
                {loading ? 'Publishing…' : 'Verify & publish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}