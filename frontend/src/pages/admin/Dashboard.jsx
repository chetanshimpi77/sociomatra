import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout.jsx'
import { IconUsers, IconClock, IconCheck, IconFileText } from '../../components/icons.jsx'
import { getEnquiries, getPosts } from '../../services/api.js'

export default function Dashboard() {
  const [enquiries, setEnquiries] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    getEnquiries().then(setEnquiries)
    getPosts().then(setPosts)
  }, [])

  const total = enquiries.length
  const pending = enquiries.filter((e) => e.status === 'New' || e.status === 'In Progress').length
  const followedUp = enquiries.filter((e) => e.status === 'Contacted' || e.status === 'Follow Up').length

  const cards = [
    { label: 'Total Enquiries', value: total, icon: IconUsers, tint: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Enquiries', value: pending, icon: IconClock, tint: 'bg-amber-50 text-amber-600' },
    { label: 'Followed Up', value: followedUp, icon: IconCheck, tint: 'bg-green-50 text-green-600' },
    { label: 'Posts Published', value: posts.length, icon: IconFileText, tint: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <AdminLayout title="Dashboard">
      <p className="text-sm text-navy-500">
        Welcome back, Admin! Here's what's happening at SocioMantra IAS Academy.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <div className="flex items-center justify-between">
              <span className={`grid h-11 w-11 place-items-center rounded-lg ${c.tint}`}>
                <c.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-extrabold text-navy-900">{c.value}</p>
            <p className="mt-1 text-xs text-navy-400">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-navy-900">Recent Student Enquiries</h3>
            <Link to="/admin/enquiries" className="text-sm font-semibold text-gold-600 hover:text-gold-700">
              View All
            </Link>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Course Interested</th>
                  <th className="pb-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-50">
                {enquiries.slice(0, 6).map((e) => (
                  <tr key={e.id}>
                    <td className="py-3 pr-4 font-medium text-navy-800">{e.name}</td>
                    <td className="py-3 pr-4 text-navy-500">{e.course}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-navy-900">Latest Post</h3>
          {posts[0] && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-navy-800">{posts[0].title}</p>
              <p className="mt-2 text-xs text-navy-500">{posts[0].excerpt}</p>
              <Link to="/admin/posts" className="btn-secondary mt-4 w-full text-sm">
                Manage Posts
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export function StatusBadge({ status }) {
  const styles = {
    New: 'bg-red-50 text-red-700',
    'In Progress': 'bg-amber-50 text-amber-700',
    Contacted: 'bg-green-50 text-green-700',
    'Follow Up': 'bg-blue-50 text-blue-700',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || 'bg-navy-50 text-navy-600'}`}>
      {status}
    </span>
  )
}
