import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import EventCard from '../components/EventCard'

const FEATURES = [
  {
    title: 'Discover events near you',
    desc:  'Browse hundreds of curated events across categories — from tech talks to live music, workshops to food festivals.',
    icon:  'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
  {
    title: 'Host with confidence',
    desc:  'Create, publish, and manage events with a simple dashboard. OTP-verified publishing keeps the platform spam-free.',
    icon:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  {
    title: 'Instant QR tickets',
    desc:  'Book your spot in seconds. A unique QR code lands in your inbox immediately — no printing, no hassle.',
    icon:  'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z',
  },
]

const STATS = [
  ['248+', 'Events hosted'],
  ['12,400+', 'Happy attendees'],
  ['50+', 'Cities covered'],
  ['4.9', 'Average rating'],
]

export default function Home() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    api.get('/api/events/').then(r => setEvents(r.data.slice(0, 6))).catch(() => {})
  }, [])

  return (
    <>
      {/* ── HERO — dark navy ── */}
      <section style={{
        background: 'var(--navy)',
        minHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end',
        paddingTop: 'var(--nav-h)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle grid lines */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(107,107,240,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(107,107,240,0.06) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}/>

        {/* Glow blob */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(107,107,240,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        {/* Content */}
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '80px 32px 72px', position: 'relative', zIndex: 1 }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--indigo-mid)' }}/>
            <span style={{ fontSize: '.78rem', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--indigo-mid)' }}>
              Event Management Platform
            </span>
          </div>

          {/* Giant headline */}
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(3.2rem, 7vw, 6rem)',
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: '-1px',
            color: '#fff',
            maxWidth: '900px',
            marginBottom: '32px',
          }}>
            Every event.{' '}
            <span style={{ color: 'var(--indigo-mid)', fontStyle: 'italic' }}>Every ticket.</span>
            {' '}One beautiful platform.
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', maxWidth: '520px', lineHeight: 1.75, marginBottom: '44px', fontWeight: 300 }}>
            Discover local experiences or launch your own event — with verified hosting, instant QR tickets, and automated email delivery.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/events">
              <button style={{
                padding: '13px 30px', background: 'var(--indigo)', color: '#fff',
                border: 'none', borderRadius: '7px', fontSize: '.95rem', fontWeight: 500,
                transition: 'background .15s, transform .1s', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#5555d0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--indigo)'; e.currentTarget.style.transform = '' }}>
                Explore events
              </button>
            </Link>
            <Link to="/register">
              <button style={{
                padding: '13px 30px', background: 'transparent', color: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.18)', borderRadius: '7px', fontSize: '.95rem', fontWeight: 400,
                transition: 'border-color .15s, color .15s', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}>
                Start hosting →
              </button>
            </Link>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '48px', marginTop: '72px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
            {STATS.map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', color: '#fff', lineHeight: 1.1, marginBottom: '4px' }}>{val}</div>
                <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '.3px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM STATEMENT — white, massive type ── */}
      <section style={{ background: '#fff', padding: '100px 32px 80px' }}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2rem, 4.5vw, 3.6rem)',
            fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.5px',
            maxWidth: '820px', marginBottom: '0',
          }}>
            Too many platforms.{' '}
            Too much friction.{' '}
            <span style={{ color: 'var(--indigo)', fontStyle: 'italic' }}>It's time to do events right.</span>
          </h2>
        </div>
      </section>

      {/* ── 3-COLUMN FEATURES — vertical dividers, prevalent.ai style ── */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{
                padding: '56px 48px 56px',
                borderRight: i < FEATURES.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                {/* Icon box */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '10px',
                  background: 'var(--indigo-dim)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '32px',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={f.icon}/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', fontWeight: 400, color: 'var(--ink)', marginBottom: '14px', lineHeight: 1.25 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '.9rem', color: 'var(--ink-2)', lineHeight: 1.8 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS GRID ── */}
      <section style={{ background: 'var(--off)', padding: '88px 32px' }}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
            <div>
              <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--indigo)', marginBottom: '10px' }}>Live now</p>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.3px' }}>
                Upcoming events
              </h2>
            </div>
            <Link to="/events" style={{ fontSize: '.875rem', color: 'var(--indigo)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              View all events →
            </Link>
          </div>

          {events.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '72px 32px', border: '1px dashed var(--border-2)', borderRadius: '12px', background: '#fff' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink-2)', marginBottom: '8px' }}>No events yet</p>
              <p style={{ fontSize: '.875rem', color: 'var(--ink-3)', marginBottom: '24px' }}>Be the first to host something extraordinary.</p>
              <Link to="/create-event">
                <button style={{ padding: '11px 24px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '.875rem', fontWeight: 500 }}>
                  Create an event
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section style={{ background: '#fff', padding: '88px 32px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--indigo)', marginBottom: '10px' }}>Browse by type</p>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 400, marginBottom: '40px', letterSpacing: '-0.3px' }}>
            Find your kind of event
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
            {[
              ['Technology','#eef2ff','#4f46e5'],
              ['Music','#f5f3ff','#7c3aed'],
              ['Business','#fff7ed','#c2410c'],
              ['Arts & Culture','#fdf2f8','#be185d'],
              ['Food & Drink','#fffbeb','#b45309'],
              ['Education','#f0fdf4','#15803d'],
              ['Networking','#eff6ff','#1d4ed8'],
              ['Health & Wellness','#f0fdfa','#0f766e'],
            ].map(([cat, bg, color]) => (
              <Link key={cat} to={`/events?category=${encodeURIComponent(cat)}`}
                style={{ display: 'block', padding: '16px 18px', background: bg, borderRadius: '8px', border: '1px solid transparent', transition: 'border-color .15s, transform .15s', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = '' }}>
                <span style={{ fontSize: '.875rem', fontWeight: 500, color }}>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER — dark navy ── */}
      <section style={{ background: 'var(--navy)', padding: '100px 32px' }}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: '48px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '.78rem', fontWeight: 500, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--indigo-mid)', marginBottom: '20px' }}>
              Ready to begin?
            </p>
            <h2 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.5px',
              color: '#fff', marginBottom: '16px',
            }}>
              Host your next<br />
              <span style={{ color: 'var(--indigo-mid)', fontStyle: 'italic' }}>unforgettable event.</span>
            </h2>
            <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '420px' }}>
              Join thousands of organizers who trust Eventify to reach their audience and create memorable experiences.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexShrink: 0 }}>
            <Link to="/register">
              <button style={{
                width: '100%', padding: '13px 32px', background: '#fff', color: 'var(--navy)',
                border: 'none', borderRadius: '7px', fontSize: '.95rem', fontWeight: 600,
                transition: 'background .15s', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#e8e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                Start for free →
              </button>
            </Link>
            <Link to="/events" style={{ textAlign: 'center', fontSize: '.8rem', color: 'rgba(255,255,255,0.35)', transition: 'color .15s' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.35)'}>
              Browse events first
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}