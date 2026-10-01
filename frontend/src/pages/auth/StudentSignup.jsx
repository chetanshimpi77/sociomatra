import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import GoogleSignInButton from '../../components/GoogleSignInButton.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function StudentSignup() {
  const { studentSignUp, loading, error, setError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [localError, setLocalError] = useState('')

  function update(field, value) {
    setError('')
    setLocalError('')
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError('')
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }
    try {
      await studentSignUp(form)
      navigate('/', { replace: true })
    } catch {
      // error already set in context
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Sign up to start your UPSC preparation journey with us."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gold-600 hover:text-gold-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {(error || localError) && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error || localError}</p>
        )}
        <div>
          <label className="field-label">Full Name</label>
          <input
            required
            className="input-field"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Your full name"
          />
        </div>
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
          <label className="field-label">Phone Number</label>
          <input
            required
            className="input-field"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="field-label">Confirm Password</label>
            <input
              type="password"
              required
              className="input-field"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
        <p className="text-center text-xs text-navy-400">
          By creating an account, you agree to our Terms &amp; Conditions and Privacy Policy.
        </p>
      </form>
      <div className="mt-6">
        <GoogleSignInButton onError={setError} />
      </div>
    </AuthLayout>
  )
}
