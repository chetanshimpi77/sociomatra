import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout.jsx'
import { forgotPassword } from '../../services/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await forgotPassword(email)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your account email and we'll help you reset it."
      footer={
        <>
          Remembered it after all?{' '}
          <Link to="/login" className="font-semibold text-gold-600 hover:text-gold-700">
            Back to sign in
          </Link>
        </>
      }
    >
      {result ? (
        <div className="space-y-4">
          <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">{result.message}</p>

          {result.resetToken && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <p className="font-semibold">Development mode</p>
              <p className="mt-1">
                No email service is configured yet, so here's your reset token directly. In production this
                would be emailed to you instead.
              </p>
              <p className="mt-2 break-all rounded bg-white px-2 py-1.5 font-mono text-[11px] text-navy-800">
                {result.resetToken}
              </p>
              <Link
                to={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}
                className="btn-primary mt-3 w-full text-sm"
              >
                Continue to Reset Password
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label className="field-label">Email</label>
            <input
              type="email"
              required
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
    </AuthLayout>
  )
}
