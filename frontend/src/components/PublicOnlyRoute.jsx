import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Guards a route that only makes sense when NOT signed in (login, signup).
// If the relevant role is already authenticated, skip straight past the
// form instead of showing it again on every refresh.
export default function PublicOnlyRoute({ role, children }) {
  const { studentUser, adminUser } = useAuth()
  const user = role === 'ADMIN' ? adminUser : studentUser

  if (user) {
    return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/'} replace />
  }

  return children
}
