import React from 'react'
import { Link } from 'react-router-dom'
import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconClock,
  IconFacebook,
  IconYoutube,
  IconInstagram,
  IconTelegram,
  IconLinkedin,
} from './icons.jsx'

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/courses', label: 'Courses' },
  { to: '/faculty', label: 'Faculty' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

const socials = [
  { icon: IconFacebook, label: 'Facebook' },
  { icon: IconYoutube, label: 'YouTube' },
  { icon: IconInstagram, label: 'Instagram' },
  { icon: IconTelegram, label: 'Telegram' },
  { icon: IconLinkedin, label: 'LinkedIn' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-100">
      <div className="container-page grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="#ffffff" fillOpacity="0.08" />
              <path d="M16 7l8 3.6v1.4H8v-1.4L16 7z" fill="#f0a020" />
              <rect x="9" y="13" width="14" height="1.6" fill="#f0a020" />
              <rect x="10" y="16" width="2" height="7" fill="#f0a020" />
              <rect x="15" y="16" width="2" height="7" fill="#f0a020" />
              <rect x="20" y="16" width="2" height="7" fill="#f0a020" />
              <rect x="8" y="24" width="16" height="1.6" fill="#f0a020" />
            </svg>
            <span className="text-lg font-extrabold text-white">
              Socio<span className="text-gold-400">Mantra</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-navy-300">Your dream. Our mission.</p>
          <p className="mt-2 text-sm text-navy-300">
            SocioMantra IAS Academy - Empowering aspirants to build a better tomorrow.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Quick Links</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-300">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-gold-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Contact Us</h4>
          <ul className="mt-4 space-y-3 text-sm text-navy-300">
            <li className="flex items-center gap-2.5">
              <IconPhone className="h-4 w-4 shrink-0 text-gold-400" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2.5">
              <IconMail className="h-4 w-4 shrink-0 text-gold-400" /> info@sociomantrias.com
            </li>
            <li className="flex items-start gap-2.5">
              <IconClock className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
              Mon - Sat : 9:00 AM - 7:00 PM (Sunday Closed)
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Our Address</h4>
          <div className="mt-4 flex items-start gap-2.5 text-sm text-navy-300">
            <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
            MukharjeeNagar, Delhi
          </div>
          <h4 className="mt-6 text-sm font-semibold uppercase tracking-wide text-white">Follow Us</h4>
          <div className="mt-3 flex gap-2.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold-500 hover:text-navy-900"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-navy-400 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} SocioMantra IAS Academy. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-gold-400">Privacy Policy</Link>
            <Link to="/" className="hover:text-gold-400">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
