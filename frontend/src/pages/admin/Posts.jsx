import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import ImageUpload from '../../components/ImageUpload.jsx'
import { IconCheck } from '../../components/icons.jsx'
import { createPost, deletePost, getAllPostsForAdmin, updatePost } from '../../services/api.js'

const emptyForm = { title: '', content: '', tag: 'Strategy', imageUrl: '', published: true }

export default function Posts() {
  const [posts, setPosts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    getAllPostsForAdmin().then(setPosts)
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function startEdit(post) {
    setEditingId(post.id)
    setForm({
      title: post.title,
      content: post.content,
      tag: post.tag || 'Strategy',
      imageUrl: post.imageUrl || '',
      published: post.published,
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title || !form.content) {
      setError('Title and content are required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        title: form.title,
        content: form.content,
        excerpt: form.content.slice(0, 140),
        tag: form.tag,
        imageUrl: form.imageUrl,
        published: form.published,
      }
      if (editingId) {
        await updatePost(editingId, payload)
        setToast('Post updated successfully.')
      } else {
        await createPost(payload)
        setToast('Post published successfully.')
      }
      cancelEdit()
      load()
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deletePost(id)
      setPosts((list) => list.filter((p) => p.id !== id))
      if (editingId === id) cancelEdit()
      setToast('Post deleted.')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AdminLayout title="Posts & Content">
      {toast && (
        <div className="mb-5 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          <IconCheck className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="card">
          <h3 className="font-bold text-navy-900">All Posts</h3>
          <div className="mt-4 divide-y divide-navy-50">
            {posts.map((p) => (
              <div key={p.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-navy-800">{p.title}</p>
                    {!p.published && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-navy-500">{p.excerpt}</p>
                  <p className="mt-2 text-xs text-navy-400">
                    By {p.author} &middot; {new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="rounded-md border border-navy-200 px-3 py-1 text-xs font-semibold text-navy-700 hover:bg-navy-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === p.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <span className="section-eyebrow shrink-0">{p.tag}</span>
              </div>
            ))}
            {posts.length === 0 && <p className="py-6 text-sm text-navy-400">No posts yet.</p>}
          </div>
        </div>

        <div className="card h-fit">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-navy-900">{editingId ? 'Edit Post' : 'Compose Post'}</h3>
            {editingId && (
              <button onClick={cancelEdit} className="text-xs font-semibold text-navy-500 hover:text-navy-800">
                Cancel edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <div>
              <label className="field-label">Post Title *</label>
              <input
                className="input-field"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Enter a catchy title..."
              />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select className="input-field" value={form.tag} onChange={(e) => update('tag', e.target.value)}>
                {['Strategy', 'Mains', 'Current Affairs', 'Resources', 'Prelims'].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Post Content *</label>
              <textarea
                rows={6}
                className="input-field"
                value={form.content}
                onChange={(e) => update('content', e.target.value)}
                placeholder="Write your post content here..."
              />
            </div>

            <ImageUpload value={form.imageUrl} onChange={(url) => update('imageUrl', url)} />

            <div>
              <label className="field-label">Post Visibility</label>
              <select
                className="input-field"
                value={form.published ? 'immediate' : 'draft'}
                onChange={(e) => update('published', e.target.value === 'immediate')}
              >
                <option value="immediate">Publish Immediately</option>
                <option value="draft">Save as Draft</option>
              </select>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
              {submitting ? 'Saving...' : editingId ? 'Update Post' : 'Publish Post'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}
