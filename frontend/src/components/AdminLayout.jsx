import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  IconDashboard,
  IconUsers,
  IconFileText,
  IconLayers,
  IconGraduationCap,
  IconSettings,
  IconLogout,
  IconBell,
  IconMenu,
  IconClose,
} from './icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/admin/enquiries', label: 'Student Enquiries', icon: IconUsers },
  { to: '/admin/posts', label: 'Posts & Content', icon: IconFileText },
  { to: '/admin/courses', label: 'Manage Courses', icon: IconLayers },
  { to: '/admin/faculty', label: 'Faculty', icon: IconGraduationCap },
  { to: '/admin/settings', label: 'Settings', icon: IconSettings },
]

export default function AdminLayout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { adminUser, adminSignOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    adminSignOut()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-navy-50/60">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-900 text-navy-100 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="#ffffff" fillOpacity="0.1" />
              <path d="M16 7l8 3.6v1.4H8v-1.4L16 7z" fill="#f0a020" />
              <rect x="9" y="13" width="14" height="1.6" fill="#f0a020" />
              <rect x="10" y="16" width="2" height="7" fill="#f0a020" />
              <rect x="15" y="16" width="2" height="7" fill="#f0a020" />
              <rect x="20" y="16" width="2" height="7" fill="#f0a020" />
              <rect x="8" y="24" width="16" height="1.6" fill="#f0a020" />
            </svg>
            <span className="leading-tight">
              <span className="block text-base font-extrabold text-white">
                Socio<span className="text-gold-400">Mantra</span>
              </span>
              <span className="block text-[10px] tracking-wide text-navy-400">IAS ACADEMY</span>
            </span>
          </Link>
          <button className="text-navy-300 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-navy-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-navy-300 hover:bg-white/5 hover:text-white"
          >
            <IconLogout className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-navy-100 bg-white px-4 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="text-navy-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <IconMenu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-navy-900 sm:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-navy-500 hover:text-navy-800" aria-label="Notifications">
              <IconBell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-gold-500 text-[9px] font-bold text-navy-900">
                3
              </span>
            </button>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy-800 text-sm font-bold text-white">
                {(adminUser?.name || 'A')[0]}
              </span>
              <span className="hidden text-sm font-semibold text-navy-800 sm:block">{adminUser?.name || 'Admin'}</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
