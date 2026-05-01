import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const isActive = path => location.pathname === path

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
      height: 'var(--nav-h)',
      background: '#fff',
      borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'var(--border)'}`,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        maxWidth: 'var(--max)', width: '100%',
        margin: '0 auto', padding: '0 32px',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '9px',
          marginRight: '28px', textDecoration: 'none',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" stroke="#6b6bf0" strokeWidth="1.5"/>
            <circle cx="11" cy="11" r="4" fill="#6b6bf0"/>
          </svg>
          <span style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--ink)', letterSpacing: '-0.2px' }}>
            Eventify
          </span>
        </Link>

        {/* Nav links */}
        {[
          ['/events', 'Discover'],
          ...(user ? [
            ['/create-event', 'Host an Event'],
            ['/dashboard', 'Dashboard'],
            ['/referral', 'Referrals'],
          ] : []),
        ].map(([path, label]) => (
          <Link key={path} to={path} style={{
            fontSize: '.875rem', fontWeight: 400,
            color: isActive(path) ? 'var(--indigo)' : 'var(--ink-2)',
            padding: '6px 14px', borderRadius: '6px',
            transition: 'color .15s',
          }}
            onMouseEnter={e => { if (!isActive(path)) e.target.style.color = 'var(--ink)' }}
            onMouseLeave={e => { if (!isActive(path)) e.target.style.color = 'var(--ink-2)' }}>
            {label}
          </Link>
        ))}

        {/* Right side */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--indigo)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: '.85rem',
              }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <button onClick={() => { logout(); navigate('/') }} style={{
                fontSize: '.85rem', fontWeight: 500, color: 'var(--ink-2)',
                background: 'none', border: '1px solid var(--border)',
                padding: '7px 16px', borderRadius: '6px',
                transition: 'border-color .15s, color .15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.color = 'var(--indigo)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-2)' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button style={{
                  fontSize: '.875rem', fontWeight: 400, color: 'var(--ink-2)',
                  background: 'none', border: 'none', padding: '7px 14px',
                  transition: 'color .15s',
                }}
                  onMouseEnter={e => e.target.style.color = 'var(--ink)'}
                  onMouseLeave={e => e.target.style.color = 'var(--ink-2)'}>
                  Sign in
                </button>
              </Link>
              <Link to="/register">
                <button style={{
                  fontSize: '.875rem', fontWeight: 500, color: '#fff',
                  background: 'var(--indigo)', border: 'none',
                  padding: '9px 22px', borderRadius: '6px',
                  transition: 'background .15s, transform .1s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#5555d0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--indigo)'; e.currentTarget.style.transform = '' }}>
                  Get started →
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}