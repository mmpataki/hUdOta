import type { FacetOption } from '../hooks/useFilter'

interface Props {
  label: string
  facetKey: string
  options: FacetOption[]
  selected: Set<string>
  onToggle: (key: string, value: string) => void
  onClear: (key: string) => void
}

export function FacetFilter({ label, facetKey, options, selected, onToggle, onClear }: Props) {
  if (options.length === 0) return null

  return (
    <div className="facet">
      <div className="facet-header">
        <h3 className="facet-title">{label}</h3>
        {selected.size > 0 && (
          <button className="btn btn-link btn-xs" onClick={() => onClear(facetKey)}>
            Clear
          </button>
        )}
      </div>
      <div className="facet-options">
        {options.map(opt => (
          <label key={opt.value} className={`facet-option ${selected.has(opt.value) ? 'selected' : ''}`}>
            <input
              type="checkbox"
              checked={selected.has(opt.value)}
              onChange={() => onToggle(facetKey, opt.value)}
            />
            <span className="facet-option-label">{opt.value}</span>
            <span className="facet-option-count">{opt.count}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
