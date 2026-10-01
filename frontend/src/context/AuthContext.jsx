import React, { createContext, useContext, useEffect, useState } from 'react'
import * as api from '../services/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Student and admin are two completely independent identities, each
  // backed by its own localStorage key (see services/api.js). You can be
  // signed in as both at once in the same browser - neither overwrites the
  // other, which is what makes refreshing any page behave consistently.
  const [studentUser, setStudentUser] = useState(() => api.getSession('STUDENT'))
  const [adminUser, setAdminUser] = useState(() => api.getSession('ADMIN'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If any authenticated API call comes back 401/403, api.js clears that
  // role's session and fires this event - react to it here so the UI
  // (ProtectedRoute etc.) immediately reflects "signed out" rather than
  // silently keeping stale state until the next full reload.
  useEffect(() => {
    function handleExpired(e) {
      if (e.detail?.role === 'ADMIN') setAdminUser(null)
      if (e.detail?.role === 'STUDENT') setStudentUser(null)
    }
    window.addEventListener('sm:session-expired', handleExpired)
    return () => window.removeEventListener('sm:session-expired', handleExpired)
  }, [])

  async function studentSignUp(form) {
    setLoading(true)
    setError('')
    try {
      const session = await api.registerStudent(form)
      setStudentUser(session)
      return session
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function studentSignIn(form) {
    setLoading(true)
    setError('')
    try {
      const session = await api.loginStudent(form)
      setStudentUser(session)
      return session
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  async function adminSignIn(form) {
    setLoading(true)
    setError('')
    try {
      const session = await api.loginAdmin(form)
      setAdminUser(session)
      return session
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  function studentSignOut() {
    api.logout('STUDENT')
    setStudentUser(null)
  }

  function adminSignOut() {
    api.logout('ADMIN')
    setAdminUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        studentUser,
        adminUser,
        loading,
        error,
        setError,
        studentSignUp,
        studentSignIn,
        adminSignIn,
        studentSignOut,
        adminSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
