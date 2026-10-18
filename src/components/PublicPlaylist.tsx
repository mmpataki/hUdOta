import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPublicSpreadsheet } from '../services/drive'
import { parseSongsFromRaw, parseMetaFromRaw, parseConfigFromRaw } from '../services/sheets'
import { useFilter } from '../hooks/useFilter'
import { SongList } from './SongList'
import { FilterPanel } from './FilterPanel'
import { ThemeToggle } from './ThemeToggle'
import type { Song, MetaKey, PlaylistConfig } from '../types'

export function PublicPlaylist() {
  const { spreadsheetId } = useParams<{ spreadsheetId: string }>()
  const [songs, setSongs] = useState<Song[]>([])
  const [metaKeys, setMetaKeys] = useState<MetaKey[]>([])
  const [config, setConfig] = useState<PlaylistConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filter = useFilter(songs, metaKeys)

  useEffect(() => {
    if (!spreadsheetId) return
    setLoading(true)
    fetchPublicSpreadsheet(spreadsheetId)
      .then(data => {
        setSongs(parseSongsFromRaw(data['Songs'] || []))
        setMetaKeys(parseMetaFromRaw(data['Meta'] || []))
        setConfig(parseConfigFromRaw(data['Config'] || []))
        setLoading(false)
      })
      .catch(() => {
        setError('Playlist not found or is private')
        setLoading(false)
      })
  }, [spreadsheetId])

  if (loading) {
    return (
      <div className="public-loading">
        <div className="loading-bar"><div className="loading-bar-fill" /></div>
        <p>Loading playlist...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="public-error">
        <h2>Oops</h2>
        <p>{error}</p>
        <a href="/" className="btn btn-primary">Go to app</a>
      </div>
    )
  }

  return (
    <div className="app-layout public-layout">
      <header className="app-header">
        <div className="header-left">
          <h1 className="public-title">{config?.playlistName || 'Playlist'}</h1>
        </div>
        <div className="header-right">
          <ThemeToggle />
          <a href="/" className="btn btn-sm">Open App</a>
        </div>
      </header>

      <div className="app-content">
        <FilterPanel
          search={filter.search}
          onSearchChange={filter.setSearch}
          facets={filter.facets}
          selectedFacets={filter.selectedFacets}
          onToggle={filter.toggleFacet}
          onClearFacet={filter.clearFacet}
          onClearAll={filter.clearAll}
          hasActiveFilters={filter.hasActiveFilters}
          songCount={filter.filteredSongs.length}
          totalCount={songs.length}
        />
        <main className="app-main">
          <SongList
            songs={filter.filteredSongs}
            customMeta={metaKeys}
            onRemove={() => {}}
            readOnly
          />
        </main>
      </div>
    </div>
  )
}
