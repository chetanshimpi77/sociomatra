import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { IconUser, IconMail, IconCheck, IconGraduationCap } from '../components/icons.jsx'
import { getFacultyMember } from '../services/api.js'

export default function FacultyDetail() {
  const { facultyId } = useParams()
  const [faculty, setFaculty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFound(false)

    getFacultyMember(facultyId)
      .then((data) => {
        if (!cancelled) setFaculty(data)
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [facultyId])

  if (notFound) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Faculty member not found</h1>
        <Link to="/faculty" className="btn-primary mt-6 inline-flex">Back to Faculty</Link>
      </div>
    )
  }

  return (
    <div>
      <PageHero eyebrow="Faculty Profile" title={faculty?.name || 'Loading...'} crumb="Faculty" subtitle={faculty?.subject} />

      <section className="container-page py-16 sm:py-20">
        {loading && <p className="text-center text-sm text-navy-400">Loading profile...</p>}

        {faculty && (
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="card h-fit text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-navy-100 text-navy-500">
                {faculty.photoUrl ? (
                  <img src={faculty.photoUrl} alt={faculty.name} className="h-full w-full object-cover" />
                ) : (
                  <IconUser className="h-12 w-12" />
                )}
              </div>
              <h2 className="mt-4 text-lg font-bold text-navy-900">{faculty.name}</h2>
              <p className="text-sm text-gold-600">{faculty.subject}</p>
              <p className="mt-1 text-xs text-navy-400">{faculty.experience}</p>
              {faculty.qualification && (
                <p className="mt-3 text-xs text-navy-500">{faculty.qualification}</p>
              )}
              {faculty.email && (
                <a
                  href={`mailto:${faculty.email}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-navy-600 hover:text-navy-900"
                >
                  <IconMail className="h-3.5 w-3.5" /> {faculty.email}
                </a>
              )}
              <Link to="/faculty" className="btn-secondary mt-5 w-full text-sm">
                Back to Faculty
              </Link>
            </div>

            <div className="space-y-6">
              {faculty.bio && (
                <div className="card">
                  <h3 className="font-bold text-navy-900">About</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-600">{faculty.bio}</p>
                </div>
              )}

              {faculty.subjectsTaught?.length > 0 && (
                <div className="card">
                  <h3 className="flex items-center gap-2 font-bold text-navy-900">
                    <IconGraduationCap className="h-5 w-5 text-gold-600" /> Subjects Taught
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {faculty.subjectsTaught.map((s) => (
                      <span key={s} className="section-eyebrow">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {faculty.achievements?.length > 0 && (
                <div className="card">
                  <h3 className="font-bold text-navy-900">Achievements &amp; Highlights</h3>
                  <ul className="mt-4 space-y-3 text-sm text-navy-700">
                    {faculty.achievements.map((a) => (
                      <li key={a} className="flex items-start gap-2.5">
                        <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="card bg-navy-900 text-white">
                <h3 className="text-lg font-bold">Want to learn from {faculty.name.split(' ')[0]}?</h3>
                <p className="mt-2 text-sm text-navy-200">
                  Explore our courses and enroll in a batch taught by our expert faculty.
                </p>
                <Link to="/courses" className="btn-primary mt-5 inline-flex">
                  Explore Courses
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
