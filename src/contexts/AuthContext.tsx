import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { initAuth, requestToken, revokeToken, getAccessToken } from '../services/auth'
import { GOOGLE_CLIENT_ID } from '../config'

interface AuthState {
  isSignedIn: boolean
  isLoading: boolean
  userName: string | null
  userEmail: string | null
  userPhoto: string | null
  signIn: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)

  const fetchUserInfo = useCallback(async () => {
    const token = getAccessToken()
    if (!token) return
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const info = await res.json()
      setUserName(info.name || null)
      setUserEmail(info.email || null)
      setUserPhoto(info.picture || null)
    }
  }, [])

  useEffect(() => {
    const waitForGsi = () => {
      if (typeof google !== 'undefined' && google.accounts) {
        initAuth(async () => {
          setIsSignedIn(true)
          setIsLoading(false)
          await fetchUserInfo()
        })
        setIsLoading(false)
      } else {
        setTimeout(waitForGsi, 100)
      }
    }
    waitForGsi()
  }, [fetchUserInfo])

  const signIn = useCallback(() => {
    requestToken()
  }, [])

  const signOut = useCallback(() => {
    revokeToken()
    setIsSignedIn(false)
    setUserName(null)
    setUserEmail(null)
    setUserPhoto(null)
  }, [])

  return (
    <AuthContext.Provider value={{ isSignedIn, isLoading, userName, userEmail, userPhoto, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
