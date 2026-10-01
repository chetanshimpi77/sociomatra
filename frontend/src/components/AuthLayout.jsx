import React from 'react'
import { Link } from 'react-router-dom'
import { IconCheck } from './icons.jsx'

const highlights = [
  'Track your enquiry and enrollment status',
  'Access study material & test results',
  'Get updates on batches and current affairs',
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-navy-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gold-500 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-navy-400 blur-3xl" />
        </div>
        <Link to="/" className="relative flex items-center gap-2.5">
          <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="6" fill="#ffffff" fillOpacity="0.1" />
            <path d="M16 7l8 3.6v1.4H8v-1.4L16 7z" fill="#f0a020" />
            <rect x="9" y="13" width="14" height="1.6" fill="#f0a020" />
            <rect x="10" y="16" width="2" height="7" fill="#f0a020" />
            <rect x="15" y="16" width="2" height="7" fill="#f0a020" />
            <rect x="20" y="16" width="2" height="7" fill="#f0a020" />
            <rect x="8" y="24" width="16" height="1.6" fill="#f0a020" />
          </svg>
          <span className="text-lg font-extrabold">
            Socio<span className="text-gold-400">Mantra</span>
          </span>
        </Link>

        <div className="relative">
          <h2 className="text-3xl font-extrabold leading-snug">
            Your Dream. <span className="text-gold-400">Our Mission.</span>
          </h2>
          <p className="mt-3 max-w-sm text-navy-200">
            Sign in to track your UPSC preparation journey with SocioMantra IAS Academy.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-sm text-navy-100">
                <IconCheck className="h-4 w-4 shrink-0 text-gold-400" /> {h}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-navy-400">&copy; {new Date().getFullYear()} SocioMantra IAS Academy</p>
      </div>

      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="#0f2347" />
              <path d="M16 7l8 3.6v1.4H8v-1.4L16 7z" fill="#f0a020" />
              <rect x="9" y="13" width="14" height="1.6" fill="#f0a020" />
              <rect x="10" y="16" width="2" height="7" fill="#f0a020" />
              <rect x="15" y="16" width="2" height="7" fill="#f0a020" />
              <rect x="20" y="16" width="2" height="7" fill="#f0a020" />
              <rect x="8" y="24" width="16" height="1.6" fill="#f0a020" />
            </svg>
            <span className="text-lg font-extrabold text-navy-800">
              Socio<span className="text-gold-500">Mantra</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-navy-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-navy-500">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-navy-500">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
