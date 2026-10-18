import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { PlaylistSelector } from './PlaylistSelector'
import { SongList } from './SongList'
import { AddSongModal } from './AddSongModal'
import { FilterPanel } from './FilterPanel'
import { Settings } from './Settings'
import { ThemeToggle } from './ThemeToggle'
import { usePlaylist } from '../hooks/usePlaylist'
import { useFilter } from '../hooks/useFilter'

export function Layout() {
  const { userName, userPhoto, signOut } = useAuth()
  const playlist = usePlaylist()
  const filter = useFilter(playlist.songs, playlist.metaKeys)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    playlist.loadPlaylists()
  }, [])

  const handleAddSong = useCallback(async (song: Parameters<typeof playlist.addSong>[0]) => {
    await playlist.addSong(song)
  }, [playlist.addSong])

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <PlaylistSelector
            playlists={playlist.playlists}
            current={playlist.currentPlaylist}
            onSelect={playlist.selectPlaylist}
            onCreate={playlist.createPlaylist}
            onDelete={playlist.deletePlaylist}
            loading={playlist.loading}
          />
        </div>
        <div className="header-right">
          {playlist.currentPlaylist && (
            <>
              <button className="btn btn-primary btn-add" onClick={() => setShowAddModal(true)}>
                <span className="btn-add-icon">+</span>
                <span className="btn-add-label">Add Song</span>
              </button>
              <button className="btn btn-icon" onClick={() => setShowSettings(true)} title="Settings">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              </button>
            </>
          )}
          <ThemeToggle />
          <div className="user-menu-container">
            <button className="btn btn-icon user-avatar" onClick={() => setShowUserMenu(!showUserMenu)}>
              {userPhoto ? (
                <img src={userPhoto} alt={userName || ''} className="avatar-img" />
              ) : (
                <span className="avatar-fallback">{(userName || '?')[0]}</span>
              )}
            </button>
            {showUserMenu && (
              <>
                <div className="user-menu">
                  <div className="user-menu-name">{userName}</div>
                  <button className="btn btn-sm btn-full" onClick={signOut}>Sign out</button>
                </div>
                <div className="backdrop" onClick={() => setShowUserMenu(false)} />
              </>
            )}
          </div>
        </div>
      </header>

      {playlist.loading && (
        <div className="loading-bar"><div className="loading-bar-fill" /></div>
      )}

      {playlist.currentPlaylist ? (
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
            totalCount={playlist.songs.length}
          />
          <main className="app-main">
            <SongList
              songs={filter.filteredSongs}
              customMeta={playlist.metaKeys}
              onRemove={playlist.removeSong}
            />
          </main>
        </div>
      ) : (
        <div className="empty-state welcome-state">
          <div className="empty-state-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <h2>Welcome!</h2>
          <p>Create or select a playlist to get started</p>
        </div>
      )}

      {showAddModal && playlist.currentPlaylist && (
        <AddSongModal
          customMeta={playlist.metaKeys}
          allSongs={playlist.songs}
          onAdd={handleAddSong}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showSettings && playlist.currentPlaylist && playlist.config && (
        <Settings
          config={playlist.config}
          metaKeys={playlist.metaKeys}
          playlistId={playlist.currentPlaylist.id}
          onAddMeta={playlist.addMeta}
          onRemoveMeta={playlist.removeMeta}
          onTogglePublic={playlist.togglePublic}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
