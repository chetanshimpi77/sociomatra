import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero.jsx'
import { IconClock, IconGraduationCap, IconLayers, IconArrowRight } from '../components/icons.jsx'
import { getCourses } from '../services/api.js'

export default function Courses() {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    getCourses().then(setCourses)
  }, [])

  return (
    <div>
      <PageHero
        eyebrow="Our Courses"
        title="Comprehensive Courses"
        accent="for UPSC Preparation"
        crumb="Courses"
        subtitle="Choose the right course for your goal. Get expert guidance, structured learning and personalised support at every stage."
      />

      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div key={c.id} className="card flex flex-col">
              <span className="section-eyebrow w-fit">{c.tagline}</span>
              <h3 className="mt-4 text-lg font-bold text-navy-900">{c.name}</h3>
              <p className="mt-2 flex-1 text-sm text-navy-500">{c.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-navy-100 pt-4 text-xs text-navy-500">
                <div className="flex items-center gap-1.5">
                  <IconClock className="h-4 w-4 text-gold-500" /> {c.duration}
                </div>
                <div className="flex items-center gap-1.5">
                  <IconGraduationCap className="h-4 w-4 text-gold-500" /> {c.mode}
                </div>
                <div className="flex items-center gap-1.5">
                  <IconLayers className="h-4 w-4 text-gold-500" /> {c.subjects} Subjects
                </div>
                <div className="flex items-center gap-1.5">
                  <IconClock className="h-4 w-4 text-gold-500" /> {c.hours} Hours
                </div>
              </div>
              <Link to={`/curriculum/${c.id}`} className="btn-dark mt-5 w-full">
                Know More <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
