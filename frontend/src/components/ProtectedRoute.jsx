import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Guards a route that requires a signed-in user of a specific role.
// Currently only used for /admin/* with role="ADMIN", but written to
// support role="STUDENT" too if student-only pages are added later.
export default function ProtectedRoute({ role, children }) {
  const { studentUser, adminUser } = useAuth()
  const location = useLocation()
  const user = role === 'ADMIN' ? adminUser : studentUser

  if (!user) {
    return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/login'} replace state={{ from: location }} />
  }

  // Defense in depth - the session is already role-scoped by storage key,
  // but double-check the token's own role claim matches too.
  if (user.role !== role) {
    return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/login'} replace />
  }

  return children
}
