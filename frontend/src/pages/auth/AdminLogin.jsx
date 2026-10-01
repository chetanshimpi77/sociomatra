import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminLogin() {
  const { adminSignIn, loading, error, setError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })

  function update(field, value) {
    setError('')
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await adminSignIn(form)
      navigate('/admin/dashboard', { replace: true })
    } catch {
      // error already set in context
    }
  }

  return (
    <AuthLayout title="Admin Sign In" subtitle="Restricted access for SocioMantra IAS Academy staff.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <div>
          <label className="field-label">Admin Email</label>
          <input
            type="email"
            required
            className="input-field"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="admin@sociomantrias.com"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="field-label">Password</label>
            <Link to="/forgot-password" className="mb-1.5 text-xs font-semibold text-navy-500 hover:text-navy-800">
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
        <button type="submit" disabled={loading} className="btn-dark w-full disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign In to Dashboard'}
        </button>
        <p className="rounded-md bg-navy-50 px-3 py-2 text-xs text-navy-500">
          Demo credentials: admin@sociomantrias.com / admin123
        </p>
      </form>
      <p className="mt-6 text-center text-xs text-navy-400">
        Not an admin?{' '}
        <Link to="/login" className="font-semibold text-navy-600 hover:text-navy-800">
          Student sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
