import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import ImageUpload from '../../components/ImageUpload.jsx'
import { IconUser, IconPlus, IconCheck } from '../../components/icons.jsx'
import { createFaculty, deleteFaculty, getFaculty, updateFaculty } from '../../services/api.js'

const emptyForm = {
  name: '',
  subject: '',
  experience: '',
  qualification: '',
  email: '',
  photoUrl: '',
  bio: '',
  subjectsTaught: '',
  achievements: '',
}

function toFormState(f) {
  return {
    name: f.name || '',
    subject: f.subject || '',
    experience: f.experience || '',
    qualification: f.qualification || '',
    email: f.email || '',
    photoUrl: f.photoUrl || '',
    bio: f.bio || '',
    subjectsTaught: (f.subjectsTaught || []).join(', '),
    achievements: (f.achievements || []).join(', '),
  }
}

function toPayload(form) {
  return {
    ...form,
    subjectsTaught: form.subjectsTaught.split(',').map((s) => s.trim()).filter(Boolean),
    achievements: form.achievements.split(',').map((s) => s.trim()).filter(Boolean),
  }
}

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([])
  const [modalMode, setModalMode] = useState(null) // 'add' | 'edit' | null
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    getFaculty().then(setFaculty)
  }

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setModalMode('add')
    setError('')
  }

  function openEdit(f) {
    setForm(toFormState(f))
    setEditingId(f.id)
    setModalMode('edit')
    setError('')
  }

  function closeModal() {
    setModalMode(null)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name || !form.subject) {
      setError('Name and subject are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = toPayload(form)
      if (modalMode === 'add') {
        await createFaculty(payload)
        setToast('Faculty member added successfully.')
      } else {
        await updateFaculty(editingId, payload)
        setToast('Faculty profile updated successfully.')
      }
      closeModal()
      load()
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this faculty member from the website? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteFaculty(id)
      setFaculty((list) => list.filter((f) => f.id !== id))
      setToast('Faculty member removed.')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout title="Faculty">
      {toast && (
        <div className="mb-5 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          <IconCheck className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-navy-500">Manage the faculty profiles shown on the public website.</p>
        <button onClick={openAdd} className="btn-primary">
          <IconPlus className="h-4 w-4" /> Add Faculty
        </button>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-navy-400">
                <th className="pb-3 pr-4">Faculty</th>
                <th className="pb-3 pr-4">Subject</th>
                <th className="pb-3 pr-4">Experience</th>
                <th className="pb-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {faculty.map((f) => (
                <tr key={f.id}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-navy-100 text-navy-500">
                        {f.photoUrl ? (
                          <img src={f.photoUrl} alt={f.name} className="h-full w-full object-cover" />
                        ) : (
                          <IconUser className="h-5 w-5" />
                        )}
                      </span>
                      <span className="font-medium text-navy-800">{f.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-navy-500">{f.subject}</td>
                  <td className="py-3 pr-4 text-navy-500">{f.experience}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(f)}
                        className="rounded-md border border-navy-200 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        disabled={deletingId === f.id}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === f.id ? 'Removing...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {faculty.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-navy-400">
                    No faculty profiles yet - click "Add Faculty" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 overflow-y-auto" onClick={closeModal}>
          <form
            onSubmit={handleSave}
            className="my-8 w-full max-w-lg space-y-4 rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-navy-900">
              {modalMode === 'add' ? 'Add Faculty' : 'Edit Faculty'}
            </h3>

            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <ImageUpload value={form.photoUrl} onChange={(url) => setForm({ ...form, photoUrl: url })} label="Photo (Optional)" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Name *</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Subject *</label>
                <input className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Experience</label>
                <input
                  className="input-field"
                  placeholder="e.g. 12+ Years Experience"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Qualification</label>
                <input className="input-field" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="field-label">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div>
              <label className="field-label">Bio</label>
              <textarea rows={3} className="input-field" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>

            <div>
              <label className="field-label">Subjects Taught (comma-separated)</label>
              <input
                className="input-field"
                placeholder="Ancient History, Medieval History, Art & Culture"
                value={form.subjectsTaught}
                onChange={(e) => setForm({ ...form, subjectsTaught: e.target.value })}
              />
            </div>

            <div>
              <label className="field-label">Achievements (comma-separated)</label>
              <input
                className="input-field"
                placeholder="Authored 2 UPSC reference books, Mentored 500+ selections"
                value={form.achievements}
                onChange={(e) => setForm({ ...form, achievements: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  )
}
