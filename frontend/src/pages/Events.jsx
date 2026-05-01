import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../lib/axios'
import EventCard from '../components/EventCard'

const CATEGORIES = ['Music','Technology','Business','Arts & Culture','Sports & Fitness','Food & Drink','Education','Networking','Health & Wellness','Entertainment','Other']

const SkeletonCard = () => (
  <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
    <div style={{ aspectRatio: '16/9', background: 'var(--off)' }}/>
    <div style={{ padding: '20px 22px' }}>
      <div style={{ height: '10px', background: 'var(--off)', borderRadius: '4px', width: '35%', marginBottom: '12px' }}/>
      <div style={{ height: '15px', background: 'var(--off)', borderRadius: '4px', marginBottom: '8px' }}/>
      <div style={{ height: '15px', background: 'var(--off)', borderRadius: '4px', width: '70%', marginBottom: '14px' }}/>
      <div style={{ height: '10px', background: 'var(--off)', borderRadius: '4px', width: '50%' }}/>
    </div>
    <style>{`@keyframes shimmer{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
  </div>
)

export default function Events() {
  const [events, setEvents]   = useState([])
  const [loading, setLoading] = useState(true)
  const [params, setParams]   = useSearchParams()

  const q        = params.get('q') || ''
  const category = params.get('category') || ''
  const date     = params.get('date') || ''

  useEffect(() => {
    setLoading(true)
    api.get('/api/events/', { params: { q, category, date } })
      .then(r => setEvents(r.data))
      .finally(() => setLoading(false))
  }, [q, category, date])

  const update = (key, val) => {
    const p = new URLSearchParams(params)
    val ? p.set(key, val) : p.delete(key)
    setParams(p)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: '#fff', border: '1.5px solid var(--border)',
    borderRadius: '8px', color: 'var(--ink)', fontSize: '.875rem',
    outline: 'none', transition: 'border-color .15s',
  }

  return (
    <div style={{ paddingTop: 'var(--nav-h)', minHeight: '100vh', background: '#fff' }}>

      {/* Page header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: '#fff', padding: '48px 32px 36px' }}>
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--indigo)', marginBottom: '10px' }}>Browse all</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400, letterSpacing: '-0.5px', marginBottom: '28px' }}>
            Discover Events
          </h1>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '200px' }}>
              <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '6px' }}>Search</p>
              <input style={inputStyle} placeholder="Search events, venues…"
                defaultValue={q}
                onBlur={e => update('q', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--indigo)'}
                onBlurCapture={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
              <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '6px' }}>Category</p>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={category} onChange={e => update('category', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--indigo)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}>
                <option value="">All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ minWidth: '150px' }}>
              <p style={{ fontSize: '.72rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: '6px' }}>Date</p>
              <input style={inputStyle} type="date" value={date} onChange={e => update('date', e.target.value)}
                onFocus={e => e.target.style.borderColor = 'var(--indigo)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            {(q || category || date) && (
              <button onClick={() => setParams({})} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--ink-2)', fontSize: '.85rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--indigo)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                Clear filters ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '36px 32px 80px' }}>
        {!loading && (
          <p style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginBottom: '24px' }}>
            {events.length} event{events.length !== 1 ? 's' : ''} found
            {category && <> in <strong style={{ color: 'var(--ink-2)' }}>{category}</strong></>}
            {q && <> matching <strong style={{ color: 'var(--ink-2)' }}>"{q}"</strong></>}
          </p>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : events.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
            {events.map(e => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 32px', border: '1px dashed var(--border-2)', borderRadius: '12px' }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink-2)', marginBottom: '8px' }}>No events found</p>
            <p style={{ fontSize: '.875rem', color: 'var(--ink-3)' }}>Try adjusting your filters or check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}