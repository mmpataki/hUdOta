import { useState } from 'react'
import { FacetFilter } from './FacetFilter'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="filter-bar">
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
        <div className="filter-bar-meta">
          <span className="song-count">
            {songCount === totalCount ? `${totalCount} songs` : `${songCount} of ${totalCount}`}
          </span>
          {hasActiveFilters && (
            <button className="btn btn-link btn-xs" onClick={onClearAll}>Clear filters</button>
          )}
        </div>
        <button
          className="btn btn-icon filter-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          title="Toggle filters"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          {hasActiveFilters && <span className="filter-badge" />}
        </button>
      </div>

      <aside className={`filter-panel ${mobileOpen ? 'open' : ''}`}>
        <div className="filter-panel-header">
          <h2>Filters</h2>
          <button className="btn btn-icon filter-close" onClick={() => setMobileOpen(false)}>
            &times;
          </button>
        </div>
        {facets.map(f => (
          <FacetFilter
            key={f.key}
            label={f.label}
            facetKey={f.key}
            options={f.options}
            selected={selectedFacets[f.key] || new Set()}
            onToggle={onToggle}
            onClear={onClearFacet}
          />
        ))}
        {facets.length === 0 && (
          <p className="filter-empty">Add songs to see filters</p>
        )}
      </aside>

      {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} />}
    </>
  )
}
