import React, { useRef, useState } from 'react'
import { IconUpload, IconClose } from './icons.jsx'
import { uploadFile } from '../services/api.js'

export default function ImageUpload({ value, onChange, label = 'Upload Image (Optional)' }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file) {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const { url } = await uploadFile(file)
      onChange(url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0]
    handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  return (
    <div>
      <label className="field-label">{label}</label>

      {value ? (
        <div className="relative w-fit">
          <img src={value} alt="Uploaded preview" className="h-28 w-28 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-navy-900 text-white shadow"
            aria-label="Remove image"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-200 px-4 py-8 text-center transition-colors hover:border-gold-400"
        >
          <IconUpload className="h-6 w-6 text-navy-400" />
          <p className="text-xs text-navy-500">
            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-[11px] text-navy-400">Supports JPG, PNG, WEBP (Max 5MB)</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}
