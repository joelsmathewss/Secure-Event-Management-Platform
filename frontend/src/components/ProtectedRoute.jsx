import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{padding:'80px',textAlign:'center',color:'var(--text-2)'}}>Loading…</div>
  return user ? children : <Navigate to="/login" replace />
}