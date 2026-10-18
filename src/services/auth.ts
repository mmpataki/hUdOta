import { GOOGLE_CLIENT_ID, SCOPES } from '../config'

let tokenClient: google.accounts.oauth2.TokenClient | null = null
let currentToken: google.accounts.oauth2.TokenResponse | null = null
let onTokenCallback: ((token: google.accounts.oauth2.TokenResponse) => void) | null = null

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
      currentToken = response
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
