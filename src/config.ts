export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
export const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
].join(' ')

export const APP_PROPERTY_KEY = 'music-playlist-app'
