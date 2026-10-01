import React, { useEffect, useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import { IconCheck, IconGraduationCap } from '../components/icons.jsx'
import { createEnquiry, getCourses } from '../services/api.js'

const initialForm = { name: '', phone: '', email: '', course: '', message: '' }

export default function Enroll() {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getCourses().then(setCourses)
  }, [])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.phone || !form.email || !form.course) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    try {
      await createEnquiry(form)
      setSent(true)
      setForm(initialForm)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHero title="Enroll" accent="Now" crumb="Enroll Now" />

      <section className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-[1fr_380px]">
        <div className="card">
          <h2 className="text-xl font-bold text-navy-900">Admission Enquiry Form</h2>
          <p className="mt-1 text-sm text-navy-500">Fill in your details and we'll get back to you soon.</p>

          {sent ? (
            <div className="mt-6 flex items-start gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-800">
              <IconCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Enquiry submitted successfully!</p>
                <p className="mt-1">Our admissions counsellor will reach out to you within 24 hours.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div>
                <label className="field-label">Full Name *</label>
                <input className="input-field" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your full name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">Phone Number *</label>
                  <input className="input-field" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="field-label">Email Address *</label>
                  <input type="email" className="input-field" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="field-label">Course Interested In *</label>
                <select className="input-field" value={form.course} onChange={(e) => update('course', e.target.value)}>
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Message (Optional)</label>
                <textarea rows={4} className="input-field" value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Anything you'd like us to know" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </form>
          )}
        </div>

        <div className="card h-fit bg-navy-900 text-white">
          <IconGraduationCap className="h-10 w-10 text-gold-400" />
          <h3 className="mt-4 text-xl font-bold">Your IAS Journey Starts Here</h3>
          <ul className="mt-6 space-y-3 text-sm text-navy-200">
            {['Expert Guidance', 'Structured Learning', 'Personal Mentorship', 'Proven Results'].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <IconCheck className="h-4 w-4 shrink-0 text-gold-400" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
