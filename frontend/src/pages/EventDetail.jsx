import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/axios'
import { useAuth } from '../context/AuthContext'

export default function EventDetail() {
  const { id }   = useParams()
  const { user } = useAuth()
  const [event, setEvent]     = useState(null)
  const [booking, setBooking] = useState(null)
  const [qr, setQr]           = useState('')
  const [loading, setLoading] = useState(true)
  const [bookLoading, setBookLoading] = useState(false)
  const [msg, setMsg]         = useState({ text: '', ok: true })

  const CAT_BG = { Music:'#f5f3ff', Technology:'#eef2ff', Business:'#fff7ed', 'Arts & Culture':'#fdf2f8', 'Sports & Fitness':'#f0fdf4', 'Food & Drink':'#fffbeb', Education:'#f5f3ff', Networking:'#eff6ff', 'Health & Wellness':'#f0fdfa', Entertainment:'#fef2f2' }

  useEffect(() => {
    api.get(`/api/events/${id}`).then(r => setEvent(r.data)).finally(() => setLoading(false))
    if (user) {
      api.get('/api/bookings/my').then(r => {
        const b = r.data.find(b => b.event_id === id)
        if (b) { setBooking(b); setQr(b.qr_code) }
      }).catch(() => {})
    }
  }, [id, user])

  const book = async () => {
    setBookLoading(true); setMsg({ text: '', ok: true })
    try {
      const { data } = await api.post('/api/bookings/', { event_id: id })
      setBooking(data.booking); setQr(data.qr_code)
      setMsg({ text: 'Booking confirmed! Your QR ticket has been sent to your email.', ok: true })
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Booking failed', ok: false })
    } finally { setBookLoading(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '12px' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border)', borderTopColor: 'var(--indigo)', borderRadius: '50%', animation: 'spin .65s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!event) return (
    <div style={{ textAlign: 'center', padding: '120px 32px', paddingTop: 'calc(var(--nav-h) + 80px)' }}>
      <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink-2)' }}>Event not found.</p>
      <Link to="/events" style={{ display: 'inline-block', marginTop: '16px', color: 'var(--indigo)', fontSize: '.875rem' }}>← Back to events</Link>
    </div>
  )

  const heroBg = CAT_BG[event.category] || 'var(--off)'

  return (
    <div style={{ paddingTop: 'var(--nav-h)', background: '#fff' }}>

      {/* Banner */}
      {event.image
        ? <img src={event.image} style={{ width: '100%', maxHeight: '420px', objectFit: 'cover', display: 'block' }} alt={event.title} />
        : <div style={{ width: '100%', height: '260px', background: heroBg, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--ink-3)', opacity: .4 }}>{event.category}</span>
          </div>
      }

      <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '48px 32px 96px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '56px' }}>

        {/* Main content */}
        <div>
          <Link to="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '.82rem', color: 'var(--ink-3)', marginBottom: '24px', transition: 'color .15s' }}
            onMouseEnter={e => e.target.style.color = 'var(--indigo)'}
            onMouseLeave={e => e.target.style.color = 'var(--ink-3)'}>
            ← Back to events
          </Link>

          <span style={{ display: 'inline-block', fontSize: '.68rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--indigo)', background: 'var(--indigo-dim)', padding: '4px 10px', borderRadius: '4px', marginBottom: '18px' }}>
            {event.category}
          </span>

          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: '28px' }}>
            {event.title}
          </h1>

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid var(--border)' }}>
            {[
              [calIcon, event.date, 'Date'],
              [clockIcon, event.time || 'TBD', 'Time'],
              [pinIcon, event.location, 'Venue'],
              [personIcon, `Hosted by ${event.host_name}`, 'Organizer'],
              event.capacity > 0 && [groupIcon, `${event.booked_count} / ${event.capacity} registered`, 'Capacity'],
            ].filter(Boolean).map(([icon, val, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--indigo-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '3px' }}>{label}</p>
                  <p style={{ fontSize: '.9rem', color: 'var(--ink)', fontWeight: 500 }}>{val}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', fontWeight: 400, marginBottom: '16px' }}>About this event</h2>
          <p style={{ fontSize: '.9rem', color: 'var(--ink-2)', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{event.description}</p>
        </div>

        {/* Sticky sidebar */}
        <div style={{ position: 'sticky', top: 'calc(var(--nav-h) + 24px)', height: 'fit-content' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 24px rgba(11,12,30,0.07)' }}>

            {/* Price */}
            <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '6px' }}>Ticket price</p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '2.2rem', fontWeight: 400, color: event.price === 0 ? '#059669' : 'var(--ink)', letterSpacing: '-0.5px' }}>
                {event.price === 0 ? 'Free' : `₹${Number(event.price).toLocaleString('en-IN')}`}
              </p>
            </div>

            {/* Message */}
            {msg.text && (
              <div style={{ padding: '11px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '.85rem', lineHeight: 1.5, background: msg.ok ? '#f0fdf4' : '#fef2f2', color: msg.ok ? '#15803d' : '#dc2626', border: `1px solid ${msg.ok ? '#bbf7d0' : '#fecaca'}` }}>
                {msg.text}
              </div>
            )}

            {/* CTA */}
            {booking ? (
              <div>
                <div style={{ padding: '11px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '.875rem', color: '#15803d', fontWeight: 500, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  You're registered
                </div>
                {qr && (
                  <>
                    <img src={`data:image/png;base64,${qr}`} style={{ width: '100%', borderRadius: '10px', border: '1px solid var(--border)' }} alt="QR Ticket" />
                    <p style={{ fontSize: '.72rem', color: 'var(--ink-3)', textAlign: 'center', marginTop: '8px', fontFamily: 'monospace' }}>Booking ref: {booking.booking_ref}</p>
                  </>
                )}
              </div>
            ) : user ? (
              event.host_id === user.id
                ? <div style={{ padding: '12px', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: '8px', textAlign: 'center', fontSize: '.875rem', color: 'var(--ink-3)' }}>This is your event</div>
                : <button onClick={book} disabled={bookLoading} style={{ width: '100%', padding: '13px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '.95rem', fontWeight: 500, cursor: bookLoading ? 'not-allowed' : 'pointer', opacity: bookLoading ? .7 : 1, transition: 'background .15s' }}
                    onMouseEnter={e => { if (!bookLoading) e.currentTarget.style.background = '#5555d0' }}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--indigo)'}>
                    {bookLoading ? 'Processing…' : 'Register for this event →'}
                  </button>
            ) : (
              <Link to="/login">
                <button style={{ width: '100%', padding: '13px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '.95rem', fontWeight: 500, cursor: 'pointer' }}>
                  Sign in to register →
                </button>
              </Link>
            )}

            {/* Trust signals */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                ['Instant ticket delivery by email'],
                ['Unique QR code for entry'],
                ['Cancel anytime before the event'],
              ].map(([text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '.8rem', color: 'var(--ink-2)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Icon helpers */
const calIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const clockIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const pinIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.7" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
const personIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.7" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const groupIcon = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>