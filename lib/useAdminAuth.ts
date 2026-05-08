'use client'
import { useState, useEffect } from 'react'

const SESSION_KEY = 'ahp_admin_pwd'

export function useAdminAuth() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed]     = useState(false)
  const [authError, setAuthError] = useState('')
  const [checking, setChecking] = useState(true)

  // On mount: check if password is stored in sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      fetch('/api/bookings/admin', { headers: { 'x-admin-password': stored } })
        .then(r => {
          if (r.ok) {
            setPassword(stored)
            setAuthed(true)
          } else {
            sessionStorage.removeItem(SESSION_KEY)
          }
          setChecking(false)
        })
        .catch(() => setChecking(false))
    } else {
      setChecking(false)
    }
  }, [])

  async function login(pwd: string) {
    setAuthError('')
    const res = await fetch('/api/bookings/admin', { headers: { 'x-admin-password': pwd } })
    if (res.status === 401) {
      setAuthError('Falsches Passwort.')
      return false
    }
    sessionStorage.setItem(SESSION_KEY, pwd)
    setPassword(pwd)
    setAuthed(true)
    return true
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAuthed(false)
    setPassword('')
  }

  return { password, setPassword, authed, authError, checking, login, logout }
}
