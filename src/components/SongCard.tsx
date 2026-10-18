import type { Song, MetaKey } from '../types'
interface Props {
  song: Song
  customMeta: MetaKey[]
  onRemove: (id: string) => void
  readOnly?: boolean
}

export function SongCard({ song, customMeta, onRemove, readOnly }: Props) {
  return (
    <div className="song-card">
      <div className="song-card-header">
        <div className="song-name-group">
          <div className="song-name-row">
            <h3 className="song-name">{song.name}</h3>
            {song.language && <span className="song-language">{song.language}</span>}
          </div>
          {song.nameRomanized && song.nameRomanized !== song.name && (
            <div className="song-romanized">{song.nameRomanized}</div>
          )}
        </div>
        {!readOnly && (
          <button
            className="btn btn-icon btn-danger-subtle song-remove"
            onClick={() => onRemove(song.id)}
            title="Remove song"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="song-meta">
        {song.vocalist.length > 0 && (
          <div className="song-meta-row">
            <span className="meta-label">Vocalist</span>
            <div className="meta-values">
              {song.vocalist.map((v, i) => (
                <span key={i} className="chip chip-sm">{v}</span>
              ))}
            </div>
          </div>
        )}

        {song.tags.length > 0 && (
          <div className="song-meta-row">
            <span className="meta-label">Tags</span>
            <div className="meta-values">
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
            <div key={m.key} className="song-meta-row">
              <span className="meta-label">{m.label}</span>
              <div className="meta-values">
                {vals.map((v, i) => (
                  <span key={i} className="chip chip-sm">{v}</span>
                ))}
              </div>
            </div>
          )
        })}

        {song.links.length > 0 && (
          <div className="song-meta-row">
            <span className="meta-label">Links</span>
            <div className="meta-values song-links">
              {song.links.map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="song-link">
                  {formatLinkLabel(link)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="song-date">{song.dateAdded}</div>
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
