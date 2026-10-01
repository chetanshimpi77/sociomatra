import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithGoogle } from '../services/api.js'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleSignInButton({ onError }) {
  const buttonRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!CLIENT_ID || !window.google?.accounts?.id || !buttonRef.current) return

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response) => {
        try {
          await loginWithGoogle(response.credential)
          navigate('/', { replace: true })
        } catch (err) {
          onError?.(err.message)
        }
      },
    })

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 320,
      text: 'continue_with',
    })
  }, [navigate, onError])

  if (!CLIENT_ID) return null

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center gap-3 text-xs text-navy-400">
        <div className="h-px flex-1 bg-navy-100" />
        or
        <div className="h-px flex-1 bg-navy-100" />
      </div>
      <div ref={buttonRef} />
    </div>
  )
}
