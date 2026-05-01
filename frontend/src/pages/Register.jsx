import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { useAuth } from '../context/AuthContext'
import OtpInput from '../components/OtpInput'

const Input = ({ label, hint, ...props }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
      <label style={{ fontSize: '.78rem', fontWeight: 600, letterSpacing: '.3px', color: 'var(--ink-2)', textTransform: 'uppercase' }}>{label}</label>
      {hint && <span style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>{hint}</span>}
    </div>
    <input {...props} style={{ width: '100%', padding: '11px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '.9rem', color: 'var(--ink)', outline: 'none', transition: 'border-color .15s', ...(props.style || {}) }}
      onFocus={e => e.target.style.borderColor = 'var(--indigo)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  </div>
)

export default function Register() {
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState({ name: '', email: '', password: '', referral_code: '' })
  const [otp, setOtp]         = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const f = k => e => setForm({ ...form, [k]: e.target.value })

  const sendOtp = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try { await api.post('/api/auth/register/send-otp', form); setStep(2) }
    catch (err) { setError(err.response?.data?.error || 'Failed to send OTP') }
    finally { setLoading(false) }
  }

  const verify = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/auth/register/verify-otp', { email: form.email, otp })
      login(data.token, data.user); navigate('/dashboard')
    } catch (err) { setError(err.response?.data?.error || 'Verification failed') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: 'var(--nav-h)' }}>

      {/* Left — dark */}
      <div style={{ background: 'var(--navy)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '72px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,107,240,0.15), transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--indigo-mid)', marginBottom: '20px' }}>
            Join Eventify
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 400, lineHeight: 1.1, color: '#fff', marginBottom: '18px', letterSpacing: '-0.5px' }}>
            Discover events.<br />
            <span style={{ color: 'var(--indigo-mid)', fontStyle: 'italic' }}>Build community.</span>
          </h1>
          <p style={{ fontSize: '.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: '300px' }}>
            A free account unlocks event bookings, hosting tools, QR tickets, and referral rewards.
          </p>

          <div style={{ marginTop: '52px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px' }}>
            {[['248+', 'Events live'], ['12k+', 'Attendees'], ['50+', 'Cities'], ['4.9★', 'Avg rating']].map(([val, label]) => (
              <div key={label} style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', color: '#fff', marginBottom: '4px' }}>{val}</div>
                <div style={{ fontSize: '.75rem', color: 'rgba(255,255,255,0.35)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ background: 'var(--off)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 64px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {step === 1 ? (
            <>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 400, letterSpacing: '-0.3px', marginBottom: '6px' }}>
                Create account
              </h2>
              <p style={{ fontSize: '.875rem', color: 'var(--ink-2)', marginBottom: '32px' }}>
                Already registered?{' '}
                <Link to="/login" style={{ color: 'var(--indigo)', fontWeight: 500 }}>Sign in</Link>
              </p>

              {error && <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '.85rem', color: '#dc2626', marginBottom: '20px' }}>{error}</div>}

              <form onSubmit={sendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <Input label="Full name" type="text" required placeholder="Jane Smith" value={form.name} onChange={f('name')} />
                <Input label="Email address" type="email" required placeholder="you@example.com" value={form.email} onChange={f('email')} />
                <Input label="Password" hint="Min. 8 characters" type="password" required minLength={8} placeholder="••••••••" value={form.password} onChange={f('password')} />
                <Input label="Referral code" hint="Optional" type="text" placeholder="Enter code" value={form.referral_code} onChange={f('referral_code')} />
                <button type="submit" disabled={loading} style={{ padding: '12px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '.95rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1, transition: 'background .15s', marginTop: '4px' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#5555d0' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--indigo)'}>
                  {loading ? 'Sending OTP…' : 'Continue →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', border: '1px solid var(--border)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 400, letterSpacing: '-0.3px', marginBottom: '6px' }}>Check your email</h2>
              <p style={{ fontSize: '.875rem', color: 'var(--ink-2)', marginBottom: '4px' }}>
                We sent a 6-digit code to <strong style={{ color: 'var(--ink)' }}>{form.email}</strong>
              </p>
              <p style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginBottom: '8px' }}>Enter it below to activate your account.</p>

              {error && <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '.85rem', color: '#dc2626', marginBottom: '8px' }}>{error}</div>}

              <form onSubmit={verify}>
                <OtpInput length={6} value={otp} onChange={setOtp} />
                <button type="submit" disabled={loading || otp.length < 6} style={{ width: '100%', padding: '12px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '.95rem', fontWeight: 500, cursor: (loading || otp.length < 6) ? 'not-allowed' : 'pointer', opacity: (loading || otp.length < 6) ? .6 : 1, transition: 'background .15s' }}
                  onMouseEnter={e => { if (!loading && otp.length === 6) e.currentTarget.style.background = '#5555d0' }}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--indigo)'}>
                  {loading ? 'Verifying…' : 'Verify & create account →'}
                </button>
              </form>
              <button onClick={() => setStep(1)} style={{ width: '100%', marginTop: '12px', padding: '11px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--ink-2)', fontSize: '.875rem', cursor: 'pointer', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                ← Use a different email
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}