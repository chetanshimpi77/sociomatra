import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import { StatusBadge } from './Dashboard.jsx'
import { IconSearch, IconChevronDown } from '../../components/icons.jsx'
import { searchEnquiries, updateEnquiryStatus } from '../../services/api.js'

const STATUSES = ['New', 'In Progress', 'Contacted', 'Follow Up']
const PAGE_SIZE = 10

export default function Enquiries() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(0) // backend pages are 0-indexed
  const [result, setResult] = useState({ content: [], totalElements: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  // Debounce the search box so we're not firing a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 350)
    return () => clearTimeout(t)
  }, [searchInput])

  // Reset to page 0 whenever the filters change.
  useEffect(() => {
    setPage(0)
  }, [debouncedSearch, statusFilter])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    searchEnquiries({ status: statusFilter, q: debouncedSearch, page, size: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) setResult(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, statusFilter, page])

  async function handleStatusChange(id, status) {
    const updated = await updateEnquiryStatus(id, status)
    setResult((r) => ({ ...r, content: r.content.map((e) => (e.id === id ? updated : e)) }))
    if (selected?.id === id) setSelected(updated)
  }

  const { content, totalElements, totalPages } = result

  return (
    <AdminLayout title="Student Enquiries">
      <div className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              className="input-field pl-9"
              placeholder="Search by name, phone, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="input-field appearance-none pr-9"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
                <th className="pb-3 pr-4">#</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Course Interested</th>
                <th className="pb-3 pr-4">Source</th>
                <th className="pb-3 pr-4">Enquiry Date</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {content.map((e, idx) => (
                <tr key={e.id}>
                  <td className="py-3 pr-4 text-navy-400">{page * PAGE_SIZE + idx + 1}</td>
                  <td className="py-3 pr-4 font-medium text-navy-800">{e.name}</td>
                  <td className="py-3 pr-4 text-navy-500">{e.phone}</td>
                  <td className="py-3 pr-4 text-navy-500">{e.email}</td>
                  <td className="py-3 pr-4 text-navy-500">{e.course}</td>
                  <td className="py-3 pr-4 text-navy-500">{e.source}</td>
                  <td className="py-3 pr-4 text-navy-500">
                    {new Date(e.enquiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <button onClick={() => setSelected(e)} className="rounded-md bg-navy-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-700">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && content.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-navy-400">
                    No enquiries match your search.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-navy-400">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-navy-500">
          <span>
            {totalElements === 0
              ? 'Showing 0 enquiries'
              : `Showing ${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalElements)} of ${totalElements} enquiries`}
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-navy-100 px-3 py-1.5 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-navy-100 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-navy-900">{selected.name}</h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Phone" value={selected.phone} />
              <Row label="Email" value={selected.email} />
              <Row label="Course" value={selected.course} />
              <Row label="Source" value={selected.source} />
              <Row label="Enquiry Date" value={new Date(selected.enquiryDate).toLocaleString('en-IN')} />
            </dl>
            <div className="mt-5">
              <label className="field-label">Update Status</label>
              <select
                className="input-field"
                value={selected.status}
                onChange={(e) => handleStatusChange(selected.id, e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary mt-6 w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-navy-50 pb-2.5">
      <dt className="text-navy-400">{label}</dt>
      <dd className="font-medium text-navy-800">{value}</dd>
    </div>
  )
}
