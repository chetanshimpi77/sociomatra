import React, { useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import { IconPhone, IconMail, IconClock, IconMapPin, IconCheck } from '../components/icons.jsx'
import { createEnquiry } from '../services/api.js'

const initialForm = { name: '', email: '', phone: '', message: '' }

export default function Contact() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.phone) {
      setError('Please fill in your name, email and phone number.')
      return
    }
    setSubmitting(true)
    try {
      await createEnquiry({
        name: form.name,
        email: form.email,
        phone: form.phone,
        course: 'General Enquiry',
      })
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
      <PageHero title="Contact" accent="Us" crumb="Contact" />

      <section className="container-page grid gap-10 py-16 sm:py-20 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-extrabold text-navy-900">Get in Touch</h2>
          <p className="mt-2 text-navy-500">Have questions? We're here to help. Reach out to us for any query, admission or course related information.</p>

          <ul className="mt-8 space-y-5">
            <li className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-100 text-navy-700">
                <IconPhone className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-navy-400">Phone</p>
                <p className="font-semibold text-navy-900">+91 98765 43210</p>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-100 text-navy-700">
                <IconMail className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-navy-400">Email</p>
                <p className="font-semibold text-navy-900">info@sociomantrias.com</p>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-100 text-navy-700">
                <IconClock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-navy-400">Working Hours</p>
                <p className="font-semibold text-navy-900">Mon - Sat : 9:00 AM - 7:00 PM (Sunday Closed)</p>
              </div>
            </li>
            <li className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy-100 text-navy-700">
                <IconMapPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm text-navy-400">Address</p>
                <p className="font-semibold text-navy-900">MukharjeeNagar, Delhi</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-navy-900">Send Us a Message</h3>

          {sent ? (
            <div className="mt-6 flex items-start gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-800">
              <IconCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold">Thanks for reaching out!</p>
                <p className="mt-1">Our counsellor will get back to you shortly.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div>
                <label className="field-label">Name *</label>
                <input className="input-field" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <label className="field-label">Email *</label>
                <input type="email" className="input-field" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="field-label">Phone Number *</label>
                <input className="input-field" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <label className="field-label">Message *</label>
                <textarea rows={4} className="input-field" value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="How can we help you?" />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20">
        <div className="h-72 w-full overflow-hidden rounded-xl border border-navy-100 bg-navy-50">
          <iframe
            title="SocioMantra IAS Academy location"
            className="h-full w-full"
            loading="lazy"
            src="https://www.google.com/maps?q=Mukherjee+Nagar,Delhi&output=embed"
          />
        </div>
      </section>
    </div>
  )
}
