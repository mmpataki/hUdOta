import { useState } from 'react'
import type { MetaKey, PlaylistConfig } from '../types'
import { getPublicUrl } from '../services/drive'

interface Props {
  config: PlaylistConfig
  metaKeys: MetaKey[]
  playlistId: string
  onAddMeta: (meta: MetaKey) => Promise<void>
  onRemoveMeta: (key: string) => Promise<void>
  onTogglePublic: () => Promise<void>
  onClose: () => void
}

export function Settings({ config, metaKeys, playlistId, onAddMeta, onRemoveMeta, onTogglePublic, onClose }: Props) {
  const [newKey, setNewKey] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newMulti, setNewMulti] = useState(true)
  const [adding, setAdding] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleAddMeta = async () => {
    const key = newKey.trim().replace(/\s+/g, '_')
    const label = newLabel.trim() || key
    if (!key) return
    setAdding(true)
    await onAddMeta({ key, label, isMultiValue: newMulti })
    setNewKey('')
    setNewLabel('')
    setNewMulti(true)
    setAdding(false)
  }

  const handleTogglePublic = async () => {
    setToggling(true)
    await onTogglePublic()
    setToggling(false)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getPublicUrl(playlistId))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-settings" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="btn btn-icon" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <section className="settings-section">
            <h3>Visibility</h3>
            <div className="settings-row">
              <div>
                <strong>{config.isPublic ? 'Public' : 'Private'}</strong>
                <p className="settings-hint">
                  {config.isPublic
                    ? 'Anyone with the link can view this playlist'
                    : 'Only you can see this playlist'}
                </p>
              </div>
              <button
                className={`toggle ${config.isPublic ? 'on' : ''}`}
                onClick={handleTogglePublic}
                disabled={toggling}
              >
                <span className="toggle-knob" />
              </button>
            </div>
            {config.isPublic && (
              <div className="settings-row">
                <input
                  type="text"
                  className="input"
                  readOnly
                  value={getPublicUrl(playlistId)}
                />
                <button className="btn btn-sm" onClick={handleCopyLink}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </section>

          <section className="settings-section">
            <h3>Custom Metadata Fields</h3>
            <p className="settings-hint">Add custom fields that appear when adding songs</p>

            {metaKeys.length > 0 && (
              <div className="meta-key-list">
                {metaKeys.map(m => (
                  <div key={m.key} className="meta-key-item">
                    <div>
                      <strong>{m.label}</strong>
                      <span className="meta-key-type">{m.isMultiValue ? 'Multi-value' : 'Single'}</span>
                    </div>
                    <button
                      className="btn btn-icon btn-danger-subtle"
                      onClick={() => onRemoveMeta(m.key)}
                      title="Remove field"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="meta-add-form">
              <input
                type="text"
                className="input"
                value={newKey}
                onChange={e => setNewKey(e.target.value)}
                placeholder="Field key (e.g. mood)"
              />
              <input
                type="text"
                className="input"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Display label (e.g. Mood)"
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newMulti}
                  onChange={e => setNewMulti(e.target.checked)}
                />
                Multi-value
              </label>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddMeta}
                disabled={!newKey.trim() || adding}
              >
                {adding ? 'Adding...' : 'Add Field'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
