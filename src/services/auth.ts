import { GOOGLE_CLIENT_ID, SCOPES } from '../config'

const TOKEN_KEY = 'playlist_access_token'
const TOKEN_EXPIRY_KEY = 'playlist_token_expiry'

let tokenClient: google.accounts.oauth2.TokenClient | null = null
let currentToken: google.accounts.oauth2.TokenResponse | null = null
let onTokenCallback: ((token: google.accounts.oauth2.TokenResponse) => void) | null = null

function persistToken(response: google.accounts.oauth2.TokenResponse) {
  currentToken = response
  sessionStorage.setItem(TOKEN_KEY, response.access_token)
  const expiresIn = (response as unknown as Record<string, string>).expires_in
  if (expiresIn) {
    const expiry = Date.now() + parseInt(expiresIn, 10) * 1000
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry))
  }
}

function clearPersistedToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY)
}

export function restoreToken(): boolean {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!token) return false
  if (expiry && Date.now() > parseInt(expiry, 10)) {
    clearPersistedToken()
    return false
  }
  currentToken = { access_token: token } as google.accounts.oauth2.TokenResponse
  return true
}

export function initAuth(callback: (token: google.accounts.oauth2.TokenResponse) => void) {
  onTokenCallback = callback
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        console.error('Auth error:', response.error)
        return
      }
      persistToken(response)
      onTokenCallback?.(response)
    },
  })
}

export function requestToken() {
  tokenClient?.requestAccessToken()
}

export function revokeToken() {
  if (currentToken?.access_token) {
    google.accounts.oauth2.revoke(currentToken.access_token, () => {
      currentToken = null
    })
  }
  currentToken = null
  clearPersistedToken()
}

export function getAccessToken(): string | null {
  return currentToken?.access_token ?? null
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken()
  if (!token) throw new Error('Not authenticated')
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
}

export { fetchWithAuth }
