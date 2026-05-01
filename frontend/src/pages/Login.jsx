import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.post('/api/auth/login', form)
      login(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', paddingTop: 'var(--nav-h)' }}>

      {/* Left — dark navy panel */}
      <div style={{
        background: 'var(--navy)', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '72px 64px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,107,240,0.18), transparent 70%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--indigo-mid)', marginBottom: '20px' }}>
            Welcome back
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)', fontWeight: 400, lineHeight: 1.1, color: '#fff', marginBottom: '18px', letterSpacing: '-0.5px' }}>
            Sign in to<br />
            <span style={{ color: 'var(--indigo-mid)', fontStyle: 'italic' }}>your account.</span>
          </h1>
          <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: '300px' }}>
            Access your tickets, manage events, and track your referrals all in one place.
          </p>

          <div style={{ marginTop: '52px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[
              'Your tickets, always at hand',
              'Manage your hosted events',
              'Track referral earnings',
            ].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid rgba(107,107,240,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--indigo-mid)' }}/>
                </div>
                <span style={{ fontSize: '.875rem', color: 'rgba(255,255,255,0.55)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ background: 'var(--off)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 64px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 400, letterSpacing: '-0.3px', marginBottom: '6px' }}>
            Sign in
          </h2>
          <p style={{ fontSize: '.875rem', color: 'var(--ink-2)', marginBottom: '32px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--indigo)', fontWeight: 500 }}>Create one free</Link>
          </p>

          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '.85rem', color: '#dc2626', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.78rem', fontWeight: 600, letterSpacing: '.3px', color: 'var(--ink-2)', marginBottom: '7px', textTransform: 'uppercase' }}>
                Email address
              </label>
              <input type="email" required placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '.9rem', color: 'var(--ink)', outline: 'none', transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--indigo)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                <label style={{ fontSize: '.78rem', fontWeight: 600, letterSpacing: '.3px', color: 'var(--ink-2)', textTransform: 'uppercase' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '.78rem', color: 'var(--indigo)', fontWeight: 500 }}>Forgot?</Link>
              </div>
              <input type="password" required placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', background: '#fff', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '.9rem', color: 'var(--ink)', outline: 'none', transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = 'var(--indigo)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              padding: '12px', background: 'var(--indigo)', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '.95rem', fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1,
              transition: 'background .15s, transform .1s', marginTop: '4px',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#5555d0'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--indigo)'; e.currentTarget.style.transform = '' }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}