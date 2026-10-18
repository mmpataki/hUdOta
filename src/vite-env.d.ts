/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_GOOGLE_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace google.accounts.oauth2 {
  interface TokenClient {
    requestAccessToken(): void
  }

  interface TokenResponse {
    access_token: string
    error?: string
  }

  function initTokenClient(config: {
    client_id: string
    scope: string
    callback: (response: TokenResponse) => void
  }): TokenClient

  function revoke(token: string, callback: () => void): void
}
