import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/axios'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [tab, setTab]           = useState('tickets')
  const [bookings, setBookings] = useState([])
  const [hosted, setHosted]     = useState([])
  const [profile, setProfile]   = useState(null)
  const [qrModal, setQrModal]   = useState(null)

  useEffect(() => {
    api.get('/api/auth/me').then(r => setProfile(r.data)).catch(() => {})
    api.get('/api/bookings/my').then(r => setBookings(r.data)).catch(() => {})
    api.get('/api/events/my').then(r => setHosted(r.data)).catch(() => {})
  }, [])

  const cancel = async id => {
    if (!confirm('Cancel this booking?')) return
    await api.put(`/api/bookings/${id}/cancel`)
    setBookings(b => b.filter(x => x.id !== id))
  }

  const deleteEvent = async id => {
    if (!confirm('Delete this event?')) return
    await api.delete(`/api/events/${id}`)
    setHosted(h => h.filter(x => x.id !== id))
  }

  const activeHosted = hosted.filter(e => e.status !== 'deleted')

  return (
    <div style={{ paddingTop: 'var(--nav-h)', background: '#fff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--off)', padding: '40px 32px' }}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--indigo)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.2rem', flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 400, letterSpacing: '-0.3px' }}>
                  {user?.name}
                </h1>
                <p style={{ fontSize: '.82rem', color: 'var(--ink-3)', marginTop: '2px' }}>{profile?.email}</p>
              </div>
            </div>
            <Link to="/create-event">
              <button style={{ padding: '10px 22px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#5555d0'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--indigo)'}>
                + Host new event
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginTop: '32px' }}>
            {[
              ['Tickets', bookings.length, 'Confirmed bookings'],
              ['Hosted', activeHosted.length, 'Published & draft'],
              ['Referrals', profile?.referral_count || 0, 'Friends invited'],
            ].map(([label, val, sub]) => (
              <div key={label} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 20px' }}>
                <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '8px' }}>{label}</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '2rem', color: 'var(--ink)', lineHeight: 1, marginBottom: '4px' }}>{val}</p>
                <p style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>{sub}</p>
              </div>
            ))}
            <div style={{ background: 'var(--indigo-dim)', border: '1px solid rgba(107,107,240,0.2)', borderRadius: '10px', padding: '18px 20px', cursor: 'pointer' }}
              onClick={() => { navigator.clipboard.writeText(profile?.referral_code || ''); alert('Referral code copied!') }}>
              <p style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--indigo)', marginBottom: '8px' }}>Referral Code</p>
              <p style={{ fontFamily: 'monospace', fontSize: '1.3rem', color: 'var(--indigo)', fontWeight: 700, letterSpacing: '2px', marginBottom: '4px' }}>{profile?.referral_code || '—'}</p>
              <p style={{ fontSize: '.72rem', color: 'var(--indigo)', opacity: .7 }}>Click to copy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + content */}
      <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
          {[['tickets', 'My Tickets'], ['hosted', 'Hosted Events'], ['account', 'Account']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: '16px 20px', background: 'none', border: 'none',
              borderBottom: `2px solid ${tab === key ? 'var(--indigo)' : 'transparent'}`,
              color: tab === key ? 'var(--indigo)' : 'var(--ink-3)',
              fontWeight: tab === key ? 600 : 400, fontSize: '.875rem',
              cursor: 'pointer', marginBottom: '-1px', transition: 'color .15s',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* TICKETS */}
        {tab === 'tickets' && (
          bookings.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bookings.map(b => (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px 22px', transition: 'border-color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '.95rem', color: 'var(--ink)', marginBottom: '4px' }}>{b.event_title}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--ink-3)', fontFamily: 'monospace', letterSpacing: '.5px' }}>REF: {b.booking_ref}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 600, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '4px' }}>Confirmed</span>
                    <button onClick={() => setQrModal(b)} style={{ padding: '7px 14px', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: '7px', fontSize: '.8rem', fontWeight: 500, color: 'var(--ink-2)', cursor: 'pointer', transition: 'border-color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--indigo)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      View QR
                    </button>
                    <button onClick={() => cancel(b.id)} style={{ padding: '7px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '7px', fontSize: '.8rem', fontWeight: 500, color: '#dc2626', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No tickets yet" desc="Browse upcoming events and register for something exciting." cta="Browse events" to="/events" />
        )}

        {/* HOSTED */}
        {tab === 'hosted' && (
          activeHosted.length ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--off)' }}>
                    {['Event', 'Date', 'Location', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '.68rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-3)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeHosted.map((e, i) => (
                    <tr key={e.id} style={{ borderBottom: i < activeHosted.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={ev => ev.currentTarget.style.background = 'var(--off)'}
                      onMouseLeave={ev => ev.currentTarget.style.background = ''}>
                      <td style={{ padding: '16px', fontWeight: 600, fontSize: '.9rem', color: 'var(--ink)' }}>{e.title}</td>
                      <td style={{ padding: '16px', fontSize: '.875rem', color: 'var(--ink-2)' }}>{e.date}</td>
                      <td style={{ padding: '16px', fontSize: '.875rem', color: 'var(--ink-2)' }}>{e.location?.slice(0, 24)}{e.location?.length > 24 ? '…' : ''}</td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '4px', background: e.status === 'published' ? '#f0fdf4' : '#fffbeb', color: e.status === 'published' ? '#15803d' : '#92400e', border: `1px solid ${e.status === 'published' ? '#bbf7d0' : '#fde68a'}` }}>
                          {e.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button onClick={() => deleteEvent(e.id)} style={{ padding: '6px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '.78rem', fontWeight: 500, color: '#dc2626', cursor: 'pointer' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <EmptyState title="No events hosted" desc="Create your first event and start building your audience." cta="Host an event" to="/create-event" />
        )}

        {/* ACCOUNT */}
        {tab === 'account' && (
          <div style={{ maxWidth: '440px' }}>
            <div style={{ background: 'var(--off)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px 20px', marginBottom: '24px', fontSize: '.875rem', color: 'var(--ink-2)' }}>
              Email address cannot be changed. Contact support if needed.
            </div>
            {[
              ['Full name', 'text', profile?.name, false],
              ['Email address', 'email', profile?.email, true],
            ].map(([label, type, val, disabled]) => (
              <div key={label} style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '7px' }}>{label}</label>
                <input type={type} defaultValue={val || ''} disabled={disabled} style={{ width: '100%', padding: '11px 14px', background: disabled ? 'var(--off)' : '#fff', border: '1.5px solid var(--border)', borderRadius: '8px', fontSize: '.9rem', color: disabled ? 'var(--ink-3)' : 'var(--ink)', outline: 'none', cursor: disabled ? 'not-allowed' : 'text', transition: 'border-color .15s' }}
                  onFocus={e => { if (!disabled) e.target.style.borderColor = 'var(--indigo)' }}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            ))}
            <button style={{ padding: '11px 22px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#5555d0'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--indigo)'}>
              Save changes
            </button>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(11,12,30,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' }}
          onClick={() => setQrModal(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '36px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(11,12,30,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '4px' }}>Your ticket</h3>
            <p style={{ fontSize: '.85rem', color: 'var(--ink-2)', marginBottom: '22px' }}>{qrModal.event_title}</p>
            <img src={`data:image/png;base64,${qrModal.qr_code}`} style={{ width: '200px', borderRadius: '10px', border: '1px solid var(--border)', margin: '0 auto 16px', display: 'block' }} alt="QR Ticket" />
            <p style={{ fontSize: '.72rem', fontFamily: 'monospace', color: 'var(--indigo)', background: 'var(--indigo-dim)', display: 'inline-block', padding: '5px 12px', borderRadius: '4px', marginBottom: '20px' }}>{qrModal.booking_ref}</p>
            <button onClick={() => setQrModal(null)} style={{ width: '100%', padding: '11px', background: 'var(--off)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '.875rem', color: 'var(--ink-2)', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ title, desc, cta, to }) {
  return (
    <div style={{ textAlign: 'center', padding: '72px 32px', border: '1px dashed var(--border-2)', borderRadius: '12px' }}>
      <p style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', color: 'var(--ink-2)', marginBottom: '8px' }}>{title}</p>
      <p style={{ fontSize: '.875rem', color: 'var(--ink-3)', marginBottom: '24px' }}>{desc}</p>
      <Link to={to}>
        <button style={{ padding: '10px 22px', background: 'var(--indigo)', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer' }}>
          {cta} →
        </button>
      </Link>
    </div>
  )
}