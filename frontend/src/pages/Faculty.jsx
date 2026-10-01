import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { IconUser, IconArrowRight } from '../components/icons.jsx'
import { getFaculty } from '../services/api.js'

export default function Faculty() {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFaculty()
      .then(setFaculty)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHero
        eyebrow="Our Faculty"
        title="Learn from"
        accent="the Best"
        crumb="Faculty"
        subtitle="Our experienced and dedicated faculty members are committed to your success. Tap on a faculty member to see their full profile."
      />

      <section className="container-page py-16 sm:py-20">
        {loading && <p className="text-center text-sm text-navy-400">Loading faculty...</p>}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {faculty.map((f) => (
            <Link
              to={`/faculty/${f.id}`}
              key={f.id}
              className="card group text-center transition-shadow hover:shadow-lg"
            >
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-navy-100 text-navy-500 overflow-hidden">
                {f.photoUrl ? (
                  <img src={f.photoUrl} alt={f.name} className="h-full w-full object-cover" />
                ) : (
                  <IconUser className="h-9 w-9" />
                )}
              </div>
              <h3 className="mt-4 font-bold text-navy-900 group-hover:text-gold-600">{f.name}</h3>
              <p className="text-sm text-gold-600">{f.subject}</p>
              <p className="mt-1 text-xs text-navy-400">{f.experience}</p>
              <span className="btn-secondary mt-5 inline-flex w-full items-center justify-center gap-1.5 text-sm">
                View Profile <IconArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        {!loading && faculty.length === 0 && (
          <p className="text-center text-sm text-navy-400">Faculty profiles will appear here once added.</p>
        )}
      </section>
    </div>
  )
}
