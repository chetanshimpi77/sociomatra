import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout.jsx'
import { IconCheck } from '../../components/icons.jsx'
import { changePassword, getSettings, updateSettings } from '../../services/api.js'

const TABS = ['General', 'Email', 'Social Media', 'Website', 'Security']

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [tab, setTab] = useState('General')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    try {
      const updated = await updateSettings(settings)
      setSettings(updated)
      setToast('Settings saved successfully.')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!settings) return null

  return (
    <AdminLayout title="Settings">
      {toast && (
        <div className="mb-5 flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          <IconCheck className="h-4 w-4" /> {toast}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                tab === t ? 'bg-navy-800 text-white' : 'text-navy-600 hover:bg-navy-50'
              }`}
            >
              {t}
            </button>
          ))}
        </nav>

        {tab === 'Security' ? (
          <ChangePasswordForm />
        ) : (
          <form onSubmit={handleSave} className="card space-y-4">
            {saveError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>}

            {tab === 'General' && (
              <>
                <div>
                  <label className="field-label">Academy Name</label>
                  <input
                    className="input-field"
                    value={settings.academyName}
                    onChange={(e) => setSettings({ ...settings, academyName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">Phone Number</label>
                  <input
                    className="input-field"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">Address</label>
                  <input
                    className="input-field"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>
              </>
            )}

            {tab === 'Email' && (
              <div>
                <label className="field-label">Contact Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            )}

            {tab === 'Social Media' && (
              <>
                {Object.keys(settings.social).map((key) => (
                  <div key={key}>
                    <label className="field-label capitalize">{key} URL</label>
                    <input
                      className="input-field"
                      placeholder={`https://${key}.com/sociomantrias`}
                      value={settings.social[key]}
                      onChange={(e) => setSettings({ ...settings, social: { ...settings.social, [key]: e.target.value } })}
                    />
                  </div>
                ))}
              </>
            )}

            {tab === 'Website' && (
              <>
                <p className="text-xs text-navy-500">
                  Controls the page title search engines show and the homepage banner copy.
                </p>
                <div>
                  <label className="field-label">SEO Title</label>
                  <input
                    className="input-field"
                    value={settings.website?.seoTitle || ''}
                    onChange={(e) => setSettings({ ...settings, website: { ...settings.website, seoTitle: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="field-label">SEO Description</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    value={settings.website?.seoDescription || ''}
                    onChange={(e) => setSettings({ ...settings, website: { ...settings.website, seoDescription: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="field-label">Homepage Hero Headline</label>
                  <input
                    className="input-field"
                    value={settings.website?.heroHeadline || ''}
                    onChange={(e) => setSettings({ ...settings, website: { ...settings.website, heroHeadline: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="field-label">Homepage Hero Subheadline</label>
                  <textarea
                    rows={2}
                    className="input-field"
                    value={settings.website?.heroSubheadline || ''}
                    onChange={(e) => setSettings({ ...settings, website: { ...settings.website, heroSubheadline: e.target.value } })}
                  />
                </div>
              </>
            )}

            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  )
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.')
      return
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    setSaving(true)
    try {
      await changePassword(form.currentPassword, form.newPassword)
      setSuccess('Password updated successfully.')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <h3 className="font-bold text-navy-900">Change Password</h3>
        <p className="mt-1 text-xs text-navy-500">Update the password used to sign in to this admin account.</p>
      </div>

      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {success && (
        <p className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
          <IconCheck className="h-4 w-4" /> {success}
        </p>
      )}

      <div>
        <label className="field-label">Current Password</label>
        <input
          type="password"
          required
          className="input-field"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">New Password</label>
        <input
          type="password"
          required
          className="input-field"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
      </div>
      <div>
        <label className="field-label">Confirm New Password</label>
        <input
          type="password"
          required
          className="input-field"
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />
      </div>

      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}
