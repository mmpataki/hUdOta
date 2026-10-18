import { useState } from 'react'
import type { Song, MetaKey } from '../types'

interface Props {
  song: Song
  customMeta: MetaKey[]
  onRemove: (id: string) => void
  readOnly?: boolean
}

export function SongCard({ song, customMeta, onRemove, readOnly }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`song-row ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
      <div className="song-row-main">
        <div className="song-row-left">
          <div className="song-name-group">
            <span className="song-name">{song.name}</span>
            {song.language && <span className="song-language">{song.language}</span>}
          </div>
          {song.nameRomanized && song.nameRomanized !== song.name && (
            <div className="song-romanized">{song.nameRomanized}</div>
          )}
        </div>
        <div className="song-row-right">
          {song.vocalist.length > 0 && (
            <span className="song-row-vocalist">{song.vocalist.join(', ')}</span>
          )}
          {song.tags.length > 0 && (
            <div className="song-row-tags">
              {song.tags.slice(0, 3).map((t, i) => (
                <span key={i} className="chip chip-sm chip-tag">{t}</span>
              ))}
              {song.tags.length > 3 && <span className="chip chip-sm">+{song.tags.length - 3}</span>}
            </div>
          )}
          <span className="song-row-date">{song.dateAdded}</span>
          <svg className={`song-row-chevron ${expanded ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="song-detail" onClick={e => e.stopPropagation()}>
          {song.vocalist.length > 0 && (
            <div className="song-detail-row">
              <span className="detail-label">Vocalist</span>
              <div className="detail-values">
                {song.vocalist.map((v, i) => (
                  <span key={i} className="chip chip-sm">{v}</span>
                ))}
              </div>
            </div>
          )}

          {song.tags.length > 0 && (
            <div className="song-detail-row">
              <span className="detail-label">Tags</span>
              <div className="detail-values">
                {song.tags.map((t, i) => (
                  <span key={i} className="chip chip-sm chip-tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {customMeta.map(m => {
            const vals = song.custom[m.key]
            if (!vals || vals.length === 0) return null
            return (
              <div key={m.key} className="song-detail-row">
                <span className="detail-label">{m.label}</span>
                <div className="detail-values">
                  {vals.map((v, i) => (
                    <span key={i} className="chip chip-sm">{v}</span>
                  ))}
                </div>
              </div>
            )
          })}

          {song.links.length > 0 && (
            <div className="song-detail-row">
              <span className="detail-label">Links</span>
              <div className="detail-values">
                {song.links.map((link, i) => (
                  <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="song-link">
                    {formatLinkLabel(link)}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="song-detail-row">
            <span className="detail-label">Added</span>
            <span className="detail-date">{song.dateAdded}</span>
          </div>

          {!readOnly && (
            <div className="song-detail-actions">
              <button
                className="btn btn-sm btn-danger-subtle"
                onClick={() => onRemove(song.id)}
              >
                Remove song
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatLinkLabel(url: string): string {
  try {
    const host = new URL(url).hostname.replace('www.', '')
    if (host.includes('youtube') || host.includes('youtu.be')) return 'YouTube'
    if (host.includes('spotify')) return 'Spotify'
    if (host.includes('soundcloud')) return 'SoundCloud'
    if (host.includes('apple')) return 'Apple Music'
    if (host.includes('bandcamp')) return 'Bandcamp'
    return host
  } catch {
    return url.slice(0, 30)
  }
}
