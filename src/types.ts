export interface Song {
  id: string
  name: string
  tags: string[]
  dateAdded: string
  links: string[]
  vocalist: string[]
  custom: Record<string, string[]>
}

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
  { key: 'tags', label: 'Tags', isMultiValue: true },
  { key: 'vocalist', label: 'Vocalist', isMultiValue: true },
  { key: 'links', label: 'Links', isMultiValue: true },
]
