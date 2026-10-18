import type { Song, MetaKey } from '../types'
import { SongCard } from './SongCard'

interface Props {
  songs: Song[]
  customMeta: MetaKey[]
  onRemove: (id: string) => void
  readOnly?: boolean
}

export function SongList({ songs, customMeta, onRemove, readOnly }: Props) {
  if (songs.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <p>No songs yet</p>
      </div>
    )
  }

  return (
    <div className="song-list">
      {songs.map(song => (
        <SongCard
          key={song.id}
          song={song}
          customMeta={customMeta}
          onRemove={onRemove}
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}
