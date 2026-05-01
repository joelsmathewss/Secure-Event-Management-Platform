import { Link } from 'react-router-dom'

const ICONS = { Music:'🎵', Technology:'💻', Business:'💼', 'Arts & Culture':'🎨', 'Sports & Fitness':'⚽', 'Food & Drink':'🍷', Education:'📚', Networking:'🤝', 'Health & Wellness':'🌿', Entertainment:'🎭' }

export default function EventCard({ event }) {
  const s = {
    card: { background:'var(--surface)', border:'1px solid var(--border-light)', borderRadius:'16px', overflow:'hidden', transition:'transform .3s, box-shadow .3s', cursor:'pointer', textDecoration:'none', display:'block', color:'inherit' },
    placeholder: { width:'100%', aspectRatio:'16/9', background:'linear-gradient(135deg,#1d1d35,#16162a)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' },
    img: { width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' },
    body: { padding:'18px' },
    cat: { fontSize:'.72rem', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', color:'var(--primary)', marginBottom:'8px' },
    title: { fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:600, color:'var(--text)', marginBottom:'10px', lineHeight:1.3 },
    meta: { display:'flex', flexWrap:'wrap', gap:'10px', fontSize:'.8rem', color:'var(--text-2)' },
    price: { marginLeft:'auto', fontWeight:700, color: event.price === 0 ? '#34d399' : 'var(--gold)' },
  }

  return (
    <Link to={`/events/${event.id}`} style={s.card}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 0 40px rgba(108,99,255,.15)' }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}>
      {event.image
        ? <img src={event.image} style={s.img} alt={event.title} />
        : <div style={s.placeholder}>{ICONS[event.category] || '✦'}</div>}
      <div style={s.body}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
          <span style={s.cat}>{event.category}</span>
          <span style={s.price}>{event.price === 0 ? 'Free' : `₹${event.price}`}</span>
        </div>
        <div style={s.title}>{event.title}</div>
        <div style={s.meta}>
          <span>📅 {event.date}</span>
          <span>📍 {event.location?.slice(0,24)}{event.location?.length > 24 ? '…' : ''}</span>
        </div>
      </div>
    </Link>
  )
}