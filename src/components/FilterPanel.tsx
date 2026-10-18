import { useState } from 'react'
import type { Facet } from '../hooks/useFilter'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  facets: Facet[]
  selectedFacets: Record<string, Set<string>>
  onToggle: (key: string, value: string) => void
  onClearFacet: (key: string) => void
  onClearAll: () => void
  hasActiveFilters: boolean
  songCount: number
  totalCount: number
}

export function FilterPanel({
  search, onSearchChange, facets, selectedFacets,
  onToggle, onClearFacet, onClearAll, hasActiveFilters,
  songCount, totalCount,
}: Props) {
  const [expandedFacet, setExpandedFacet] = useState<string | null>(null)

  const activeChips: { facetKey: string; facetLabel: string; value: string }[] = []
  for (const [key, values] of Object.entries(selectedFacets)) {
    const facet = facets.find(f => f.key === key)
    if (!facet) continue
    for (const v of values) {
      activeChips.push({ facetKey: key, facetLabel: facet.label, value: v })
    }
  }

  return (
    <div className="filter-section">
      <div className="filter-top">
        <div className="search-box">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search songs..."
            className="search-input"
          />
          {search && (
            <button className="btn btn-icon btn-xs search-clear" onClick={() => onSearchChange('')}>
              &times;
            </button>
          )}
        </div>

        <div className="filter-facet-buttons">
          {facets.map(f => (
            <button
              key={f.key}
              className={`btn btn-sm filter-facet-btn ${selectedFacets[f.key]?.size ? 'active' : ''} ${expandedFacet === f.key ? 'open' : ''}`}
              onClick={() => setExpandedFacet(expandedFacet === f.key ? null : f.key)}
            >
              {f.label}
              {selectedFacets[f.key]?.size ? ` (${selectedFacets[f.key].size})` : ''}
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5l3 3 3-3" />
              </svg>
            </button>
          ))}
        </div>

        <span className="song-count">
          {songCount === totalCount ? `${totalCount} songs` : `${songCount} / ${totalCount}`}
        </span>
      </div>

      {activeChips.length > 0 && (
        <div className="filter-active-chips">
          {activeChips.map((c, i) => (
            <button key={i} className="chip chip-active" onClick={() => onToggle(c.facetKey, c.value)}>
              <span className="chip-facet-label">{c.facetLabel}:</span> {c.value}
              <span className="chip-remove">&times;</span>
            </button>
          ))}
          <button className="btn btn-link btn-xs" onClick={onClearAll}>Clear all</button>
        </div>
      )}

      {expandedFacet && (
        <div className="filter-dropdown">
          {(() => {
            const facet = facets.find(f => f.key === expandedFacet)
            if (!facet) return null
            const selected = selectedFacets[expandedFacet] || new Set<string>()
            return (
              <>
                <div className="filter-dropdown-header">
                  <span>{facet.label}</span>
                  {selected.size > 0 && (
                    <button className="btn btn-link btn-xs" onClick={() => onClearFacet(expandedFacet)}>Clear</button>
                  )}
                </div>
                <div className="filter-dropdown-options">
                  {facet.options.map(opt => (
                    <label key={opt.value} className={`filter-option ${selected.has(opt.value) ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selected.has(opt.value)}
                        onChange={() => onToggle(expandedFacet, opt.value)}
                      />
                      <span className="filter-option-label">{opt.value}</span>
                      <span className="filter-option-count">{opt.count}</span>
                    </label>
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      )}

      {expandedFacet && <div className="backdrop" onClick={() => setExpandedFacet(null)} />}
    </div>
  )
}
