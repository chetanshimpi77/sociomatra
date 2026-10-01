import React, { useEffect, useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { IconMenu, IconClose, IconUser, IconChevronDown } from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import logo from '../assets/logo.jpeg'

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/courses', label: 'Courses' },
  { to: '/faculty', label: 'Faculty' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { studentUser, adminUser, studentSignOut, adminSignOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(false)
  }, [])

  function handleStudentSignOut() {
    studentSignOut()
    setMenuOpen(false)
    navigate('/')
  }

  function handleAdminSignOut() {
    adminSignOut()
    setMenuOpen(false)
    navigate('/')
  }

  const isSignedIn = Boolean(studentUser || adminUser)

  return (
    <header className="sticky top-0 z-40 border-b border-navy-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-[68px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img
  src={logo}
  alt="SocioMantra IAS Academy"
  className="h-10 w-10 rounded-md object-contain"
/>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold text-navy-800">
              Socio<span className="text-gold-500">Mantra</span>
            </span>
            <span className="block text-[10px] font-semibold tracking-wide text-navy-500">
              IAS ACADEMY
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-gold-600' : 'text-navy-700 hover:text-navy-900'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/enroll" className="btn-primary">
            Enroll Now
          </Link>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-navy-100 p-1.5 pr-2 text-navy-700 hover:bg-navy-50"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-white">
                <IconUser className="h-4 w-4" />
              </span>
              <IconChevronDown className="h-3.5 w-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-navy-100 bg-white py-1 shadow-lg">
                {studentUser && (
                  <>
                    <div className="px-4 py-2 text-xs text-navy-400">Signed in as (Student)</div>
                    <div className="px-4 pb-2 text-sm font-semibold text-navy-800">{studentUser.name}</div>
                    <button
                      onClick={handleStudentSignOut}
                      className="block w-full px-4 py-2.5 text-left text-sm text-navy-700 hover:bg-navy-50"
                    >
                      Sign Out
                    </button>
                  </>
                )}

                {studentUser && adminUser && <div className="my-1 border-t border-navy-100" />}

                {adminUser && (
                  <>
                    <div className="px-4 py-2 text-xs text-navy-400">Signed in as (Admin)</div>
                    <div className="px-4 pb-2 text-sm font-semibold text-navy-800">{adminUser.name}</div>
                    <Link
                      onClick={() => setMenuOpen(false)}
                      to="/admin/dashboard"
                      className="block px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50"
                    >
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={handleAdminSignOut}
                      className="block w-full px-4 py-2.5 text-left text-sm text-navy-700 hover:bg-navy-50"
                    >
                      Sign Out
                    </button>
                  </>
                )}

                {!studentUser && (
                  <>
                    {isSignedIn && <div className="my-1 border-t border-navy-100" />}
                    <Link
                      onClick={() => setMenuOpen(false)}
                      to="/login"
                      className="block px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50"
                    >
                      Student Sign In
                    </Link>
                    <Link
                      onClick={() => setMenuOpen(false)}
                      to="/signup"
                      className="block px-4 py-2.5 text-sm text-navy-700 hover:bg-navy-50"
                    >
                      Create Student Account
                    </Link>
                  </>
                )}

                {!adminUser && (
                  <>
                    <div className="my-1 border-t border-navy-100" />
                    <Link
                      onClick={() => setMenuOpen(false)}
                      to="/admin/login"
                      className="block px-4 py-2.5 text-sm text-navy-500 hover:bg-navy-50"
                    >
                      Admin Sign In
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-md text-navy-800 lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-100 bg-white px-4 pb-5 pt-2 lg:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `border-b border-navy-50 py-3 text-sm font-medium ${
                    isActive ? 'text-gold-600' : 'text-navy-700'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/enroll" onClick={() => setOpen(false)} className="btn-primary w-full">
              Enroll Now
            </Link>
            {!studentUser && (
              <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary w-full">
                Student Sign In
              </Link>
            )}
            {studentUser && (
              <button onClick={handleStudentSignOut} className="btn-secondary w-full">
                Sign Out (Student)
              </button>
            )}
            {adminUser && (
              <button onClick={handleAdminSignOut} className="btn-secondary w-full">
                Sign Out (Admin)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
