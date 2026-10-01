import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import GoogleSignInButton from '../../components/GoogleSignInButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function StudentLogin() {
  const { studentSignIn, loading, error, setError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })

  function update(field, value) {
    setError('')
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await studentSignIn(form)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch {
      // error already set in context
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your student account to continue."
      footer={
        <>
          New to SocioMantra?{' '}
          <Link to="/signup" className="font-semibold text-gold-600 hover:text-gold-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="field-label">Email</label>
          <input
            type="email"
            required
            className="input-field"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="field-label">Password</label>
            <Link to="/forgot-password" className="mb-1.5 text-xs font-semibold text-gold-600 hover:text-gold-700">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            className="input-field"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-6">
        <GoogleSignInButton onError={setError} />
      </div>
      <p className="mt-6 text-center text-xs text-navy-400">
        Are you an academy admin?{' '}
        <Link to="/admin/login" className="font-semibold text-navy-600 hover:text-navy-800">
          Admin sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
