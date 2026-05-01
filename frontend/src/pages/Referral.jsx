import { useEffect, useState } from 'react'
import api from '../lib/axios'

export default function Referral() {
  const [data, setData] = useState({ user: {}, referred_users: [] })

  useEffect(() => {
    api.get('/api/referrals/my').then(r => setData(r.data)).catch(() => {})
  }, [])

  const code = data.user?.referral_code || ''
  const link = `${window.location.origin}/register?ref=${code}`

  const s = {
    page: { maxWidth:'700px', margin:'0 auto', padding:'100px 24px 80px' },
    title: { fontFamily:'var(--font-display)', fontSize:'2.5rem', fontWeight:300, marginBottom:'8px' },
    sub: { color:'var(--text-2)', marginBottom:'40px' },
    code: { fontFamily:'var(--font-mono)', fontSize:'1.8rem', fontWeight:700, color:'var(--gold)', background:'rgba(212,175,112,.1)', border:'1px solid rgba(212,175,112,.3)', padding:'24px', borderRadius:'16px', textAlign:'center', letterSpacing:'4px', cursor:'pointer', marginBottom:'16px', transition:'background .2s' },
    linkBox: { background:'var(--surface)', border:'1px solid var(--border-light)', borderRadius:'10px', padding:'12px 16px', fontFamily:'var(--font-mono)', fontSize:'.8rem', color:'var(--text-2)', marginBottom:'32px', wordBreak:'break-all', cursor:'pointer' },
    table: { width:'100%', borderCollapse:'collapse' },
    th: { padding:'12px 14px', textAlign:'left', fontSize:'.75rem', fontWeight:600, letterSpacing:'.8px', textTransform:'uppercase', color:'var(--text-3)', borderBottom:'1px solid var(--border-light)' },
    td: { padding:'14px', borderBottom:'1px solid var(--border-light)', fontSize:'.9rem', color:'var(--text-2)' },
  }

  const copy = text => { navigator.clipboard.writeText(text); alert('Copied!') }

  return (
    <div style={s.page}>
      <div style={{ fontSize:'.72rem', fontWeight:700, letterSpacing:'3px', textTransform:'uppercase', color:'var(--primary)', marginBottom:'8px' }}>✦ Refer & Earn</div>
      <h1 style={s.title}>Invite <strong style={{ fontWeight:600, color:'var(--gold)' }}>Friends</strong></h1>
      <p style={s.sub}>Share your unique code and grow the Eventify community.</p>

      <div style={s.code} onClick={() => copy(code)}>{code || '—'}</div>
      <p style={{ color:'var(--text-3)', fontSize:'.8rem', textAlign:'center', marginBottom:'16px' }}>Click to copy code</p>
      <div style={s.linkBox} onClick={() => copy(link)}>🔗 {link}</div>

      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', marginBottom:'16px' }}>
        Friends Referred <span style={{ color:'var(--primary)', fontWeight:400 }}>({data.referred_users.length})</span>
      </h3>

      {data.referred_users.length ? (
        <table style={s.table}>
          <thead><tr><th style={s.th}>Name</th><th style={s.th}>Email</th><th style={s.th}>Joined</th></tr></thead>
          <tbody>{data.referred_users.map(u => (
            <tr key={u.id}>
              <td style={{ ...s.td, color:'var(--text)', fontWeight:500 }}>{u.name}</td>
              <td style={s.td}>{u.email}</td>
              <td style={s.td}>{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}</tbody>
        </table>
      ) : (
        <p style={{ color:'var(--text-2)', textAlign:'center', padding:'40px 0' }}>No referrals yet. Share your code to get started!</p>
      )}
    </div>
  )
}