import React from 'react'
import { Link } from 'react-router-dom'
import bgImage from '../assets/bgImage.png'

export default function PageHero({
  eyebrow,
  title,
  accent,
  crumb,
  subtitle,
}) {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: 'center right',
      }}
    >

      {/* Light dark overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Content */}
      <div className="container-page relative z-10 py-14 sm:py-16">

        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold-400">
            {eyebrow}
          </p>
        )}

        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          {title}{' '}
          {accent && (
            <span className="text-gold-400">
              {accent}
            </span>
          )}
        </h1>

        {subtitle && (
          <p className="mt-3 max-w-2xl text-navy-200">
            {subtitle}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm text-navy-100">
          <Link
            to="/"
            className="hover:text-gold-400"
          >
            Home
          </Link>

          <span>›</span>

          <span>
            {crumb}
          </span>
        </div>

      </div>
    </section>
  )
}