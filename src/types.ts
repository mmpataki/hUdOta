export interface Song {
  id: string
  name: string
  nameRomanized: string
  language: string
  tags: string[]
  dateAdded: string
  links: string[]
  vocalist: string[]
  custom: Record<string, string[]>
}

export const LANGUAGES = [
  { code: '', label: 'None' },
  { code: 'en', label: 'English', itc: '' },
  { code: 'hi', label: 'Hindi', itc: 'hi-t-i0-und' },
  { code: 'kn', label: 'Kannada', itc: 'kn-t-i0-und' },
  { code: 'ta', label: 'Tamil', itc: 'ta-t-i0-und' },
  { code: 'te', label: 'Telugu', itc: 'te-t-i0-und' },
  { code: 'ml', label: 'Malayalam', itc: 'ml-t-i0-und' },
  { code: 'bn', label: 'Bengali', itc: 'bn-t-i0-und' },
  { code: 'mr', label: 'Marathi', itc: 'mr-t-i0-und' },
  { code: 'gu', label: 'Gujarati', itc: 'gu-t-i0-und' },
  { code: 'pa', label: 'Punjabi', itc: 'pa-t-i0-und' },
  { code: 'ur', label: 'Urdu', itc: 'ur-t-i0-und' },
] as const

export interface MetaKey {
  key: string
  label: string
  isMultiValue: boolean
}

export interface PlaylistConfig {
  isPublic: boolean
  playlistName: string
  createdAt: string
}

export interface PlaylistInfo {
  id: string
  name: string
}

export interface FilterState {
  search: string
  facets: Record<string, Set<string>>
}

export const MULTI_VALUE_DELIMITER = '|||'

export const BUILT_IN_FIELDS: MetaKey[] = [
  { key: 'language', label: 'Language', isMultiValue: false },
  { key: 'tags', label: 'Tags', isMultiValue: true },
  { key: 'vocalist', label: 'Vocalist', isMultiValue: true },
  { key: 'links', label: 'Links', isMultiValue: true },
]
