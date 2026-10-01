import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-gold-600">404</p>
      <h1 className="mt-3 text-3xl font-extrabold text-navy-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-navy-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="btn-primary mt-7 inline-flex">
        Back to Home
      </Link>
    </div>
  )
}
