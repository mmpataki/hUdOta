import { useState } from 'react'
import type { PlaylistInfo } from '../types'

interface Props {
  playlists: PlaylistInfo[]
  current: PlaylistInfo | null
  onSelect: (p: PlaylistInfo) => void
  onCreate: (name: string) => void
  onDelete: (id: string) => void
  loading: boolean
}

export function PlaylistSelector({ playlists, current, onSelect, onCreate, onDelete, loading }: Props) {
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [showList, setShowList] = useState(false)

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim())
      setNewName('')
      setShowCreate(false)
      setShowList(false)
    }
  }

  return (
    <div className="playlist-selector">
      <button
        className="btn playlist-selector-trigger"
        onClick={() => setShowList(!showList)}
      >
        <span className="playlist-name">{current?.name || 'Select playlist'}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {showList && (
        <div className="playlist-dropdown">
          {playlists.length === 0 && !loading && (
            <div className="playlist-empty">No playlists yet</div>
          )}
          {playlists.map(p => (
            <div
              key={p.id}
              className={`playlist-item ${p.id === current?.id ? 'active' : ''}`}
            >
              <button className="playlist-item-name" onClick={() => { onSelect(p); setShowList(false) }}>
                {p.name}
              </button>
              <button
                className="btn btn-icon btn-danger-subtle"
                onClick={(e) => { e.stopPropagation(); onDelete(p.id) }}
                title="Delete playlist"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                </svg>
              </button>
            </div>
          ))}

          <div className="playlist-create-section">
            {showCreate ? (
              <div className="playlist-create-form">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="Playlist name"
                  autoFocus
                  className="input"
                />
                <div className="playlist-create-actions">
                  <button className="btn btn-sm btn-primary" onClick={handleCreate} disabled={!newName.trim()}>
                    Create
                  </button>
                  <button className="btn btn-sm" onClick={() => { setShowCreate(false); setNewName('') }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-sm btn-full" onClick={() => setShowCreate(true)}>
                + New Playlist
              </button>
            )}
          </div>
        </div>
      )}

      {showList && <div className="backdrop" onClick={() => setShowList(false)} />}
    </div>
  )
}
