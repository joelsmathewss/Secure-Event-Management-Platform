import { useRef } from 'react'

export default function OtpInput({ length = 6, value, onChange }) {
  const inputs = useRef([])

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const arr = value.split('')
    arr[i]    = val
    onChange(arr.join(''))
    if (val && i < length - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const s = {
    wrap: { display:'flex', gap:'10px', justifyContent:'center', margin:'20px 0' },
    box: { width:'52px', height:'62px', borderRadius:'10px', background:'var(--surface-2,#16162a)', border:'1px solid var(--border-light)', color:'var(--text)', fontSize:'1.4rem', fontWeight:700, textAlign:'center', outline:'none', fontFamily:'var(--font-mono)', transition:'border-color .2s' },
  }

  return (
    <div style={s.wrap}>
      {Array.from({ length }).map((_, i) => (
        <input key={i} ref={el => inputs.current[i] = el}
          style={s.box} type="text" maxLength={1} inputMode="numeric"
          value={value[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
        />
      ))}
    </div>
  )
}