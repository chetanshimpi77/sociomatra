import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import { IconCheck, IconPlus } from '../../components/icons.jsx'
import { createCourse, deleteCourse, getCourses, updateCourse } from '../../services/api.js'

const emptyForm = {
  id: '',
  name: '',
  tagline: '',
  duration: '',
  mode: '',
  subjects: '',
  hours: '',
  description: '',
  color: 'navy',
  keyFeatures: '',
}

function toFormState(c) {
  return {
    id: c.id || '',
    name: c.name || '',
    tagline: c.tagline || '',
    duration: c.duration || '',
    mode: c.mode || '',
    subjects: c.subjects ?? '',
    hours: c.hours || '',
    description: c.description || '',
    color: c.color || 'navy',
    keyFeatures: (c.keyFeatures || []).join(', '),
  }
}

function toPayload(form) {
  return {
    ...form,
    subjects: form.subjects === '' ? null : Number(form.subjects),
    keyFeatures: form.keyFeatures.split(',').map((s) => s.trim()).filter(Boolean),
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function ManageCourses() {
  const [courses, setCourses] = useState([])
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
    getCourses().then(setCourses)
  }

  function openAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setModalMode('add')
    setError('')
  }

  function openEdit(course) {
    setForm(toFormState(course))
    setEditingId(course.id)
    setModalMode('edit')
    setError('')
  }

  function closeModal() {
    setModalMode(null)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name) {
      setError('Course name is required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (modalMode === 'add') {
        const id = form.id ? slugify(form.id) : slugify(form.name)
        if (!id) {
          setError('Could not generate a course id from that name - try adding one manually.')
          setSaving(false)
          return
        }
        if (courses.some((c) => c.id === id)) {
          setError(`A course with id "${id}" already exists - choose a different name or id.`)
          setSaving(false)
          return
        }
        await createCourse({ ...toPayload(form), id })
        setToast('Course added successfully.')
      } else {
        await updateCourse(editingId, toPayload(form))
        setToast('Course updated successfully.')
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
    if (!window.confirm('Delete this course? Its curriculum will also be removed. This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteCourse(id)
      setCourses((list) => list.filter((c) => c.id !== id))
      setToast('Course deleted.')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout title="Manage Courses">
      {toast && (
        <div className="mb-5 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          <IconCheck className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-navy-500">Manage the courses shown on the public website.</p>
        <button onClick={openAdd} className="btn-primary">
          <IconPlus className="h-4 w-4" /> Add Course
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => (
          <div key={c.id} className="card flex flex-col">
            <span className="section-eyebrow w-fit">{c.tagline}</span>
            <h3 className="mt-3 font-bold text-navy-900">{c.name}</h3>
            <p className="mt-2 flex-1 text-sm text-navy-500">{c.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-navy-500">
              <span>Duration: {c.duration}</span>
              <span>Mode: {c.mode}</span>
              <span>Subjects: {c.subjects}</span>
              <span>Hours: {c.hours}</span>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => openEdit(c)} className="btn-secondary flex-1 text-sm">
                Edit
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                className="flex-1 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deletingId === c.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-navy-400">
            No courses yet - click "Add Course" to create one.
          </p>
        )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 overflow-y-auto" onClick={closeModal}>
          <form
            onSubmit={handleSave}
            className="my-8 w-full max-w-lg space-y-4 rounded-xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-navy-900">
              {modalMode === 'add' ? 'Add Course' : 'Edit Course'}
            </h3>

            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div>
              <label className="field-label">Course Name *</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            {modalMode === 'add' && (
              <div>
                <label className="field-label">Course ID (URL slug, optional)</label>
                <input
                  className="input-field"
                  placeholder="auto-generated from the name if left blank"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="field-label">Tagline</label>
              <input className="input-field" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label">Duration</label>
                <input className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Mode</label>
                <input className="input-field" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Total Subjects</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  value={form.subjects}
                  onChange={(e) => setForm({ ...form, subjects: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Total Hours</label>
                <input className="input-field" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="field-label">Description</label>
              <textarea rows={3} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label className="field-label">Key Features (comma-separated)</label>
              <input
                className="input-field"
                placeholder="Concept-based learning, Regular mock tests, Revision notes"
                value={form.keyFeatures}
                onChange={(e) => setForm({ ...form, keyFeatures: e.target.value })}
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
