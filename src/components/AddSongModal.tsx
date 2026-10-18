import { useState, useMemo } from 'react'
import type { Song, MetaKey } from '../types'
import { LANGUAGES } from '../types'
import { TagInput } from './TagInput'
import { TransliterateInput } from './TransliterateInput'

interface Props {
  customMeta: MetaKey[]
  allSongs: Song[]
  onAdd: (song: Omit<Song, 'id' | 'dateAdded'>) => Promise<void>
  onClose: () => void
}

export function AddSongModal({ customMeta, allSongs, onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [nameRomanized, setNameRomanized] = useState('')
  const [language, setLanguage] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [links, setLinks] = useState<string[]>([])
  const [vocalist, setVocalist] = useState<string[]>([])
  const [customValues, setCustomValues] = useState<Record<string, string[]>>({})
  const [saving, setSaving] = useState(false)

  const selectedLang = LANGUAGES.find(l => l.code === language)
  const itc = selectedLang && 'itc' in selectedLang ? selectedLang.itc : ''

  const tagSuggestions = useMemo(() => {
    const set = new Set<string>()
    allSongs.forEach(s => s.tags.forEach(t => set.add(t)))
    return Array.from(set).sort()
  }, [allSongs])

  const vocalistSuggestions = useMemo(() => {
    const set = new Set<string>()
    allSongs.forEach(s => s.vocalist.forEach(v => set.add(v)))
    return Array.from(set).sort()
  }, [allSongs])

  const customSuggestions = useMemo(() => {
    const map: Record<string, string[]> = {}
    customMeta.forEach(m => {
      const set = new Set<string>()
      allSongs.forEach(s => (s.custom[m.key] || []).forEach(v => set.add(v)))
      map[m.key] = Array.from(set).sort()
    })
    return map
  }, [customMeta, allSongs])

  const handleLanguageChange = (code: string) => {
    setLanguage(code)
    setName('')
    setNameRomanized('')
  }

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onAdd({
      name: name.trim(),
      nameRomanized: nameRomanized.trim() || name.trim(),
      language: selectedLang?.label || '',
      tags,
      links,
      vocalist,
      custom: customValues,
    })
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Song</h2>
          <button className="btn btn-icon" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Language</label>
            <select
              className="input"
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Song Name *</label>
            {itc ? (
              <TransliterateInput
                value={name}
                romanized={nameRomanized}
                itc={itc}
                onChangeNative={setName}
                onChangeRomanized={setNameRomanized}
                placeholder="Type in English, it will transliterate..."
              />
            ) : (
              <input
                type="text"
                className="input"
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  setNameRomanized(e.target.value)
                }}
                placeholder="Enter song name"
                autoFocus
              />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Vocalist</label>
            <TagInput
              values={vocalist}
              onChange={setVocalist}
              placeholder="Add vocalist"
              suggestions={vocalistSuggestions}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <TagInput
              values={tags}
              onChange={setTags}
              placeholder="Add tags"
              suggestions={tagSuggestions}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Links</label>
            <TagInput
              values={links}
              onChange={setLinks}
              placeholder="Paste URL and press Enter"
            />
          </div>

          {customMeta.map(m => (
            <div key={m.key} className="form-group">
              <label className="form-label">{m.label}</label>
              {m.isMultiValue ? (
                <TagInput
                  values={customValues[m.key] || []}
                  onChange={vals => setCustomValues(prev => ({ ...prev, [m.key]: vals }))}
                  placeholder={`Add ${m.label.toLowerCase()}`}
                  suggestions={customSuggestions[m.key]}
                />
              ) : (
                <input
                  type="text"
                  className="input"
                  value={(customValues[m.key] || [])[0] || ''}
                  onChange={e => setCustomValues(prev => ({ ...prev, [m.key]: [e.target.value] }))}
                  placeholder={m.label}
                />
              )}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
          >
            {saving ? 'Adding...' : 'Add Song'}
          </button>
        </div>
      </div>
    </div>
  )
}
