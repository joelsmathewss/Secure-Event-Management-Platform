import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Dashboard from './pages/Dashboard'
import CreateEvent from './pages/CreateEvent'
import Referral from './pages/Referral'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/events"        element={<Events />} />
        <Route path="/events/:id"    element={<EventDetail />} />
        <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-event"  element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
        <Route path="/referral"      element={<ProtectedRoute><Referral /></ProtectedRoute>} />
      </Routes>
    </>
  )
}