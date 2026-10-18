import { useState, useMemo, useCallback } from 'react'
import type { Song, MetaKey } from '../types'
import { BUILT_IN_FIELDS } from '../types'

export interface FacetOption {
  value: string
  count: number
}

export interface Facet {
  key: string
  label: string
  options: FacetOption[]
}

export function useFilter(songs: Song[], customMeta: MetaKey[]) {
  const [search, setSearch] = useState('')
  const [selectedFacets, setSelectedFacets] = useState<Record<string, Set<string>>>({})

  const allFields = useMemo(() => [...BUILT_IN_FIELDS, ...customMeta], [customMeta])

  const getSongValues = useCallback((song: Song, key: string): string[] => {
    switch (key) {
      case 'tags': return song.tags
      case 'vocalist': return song.vocalist
      case 'links': return song.links
      default: return song.custom[key] || []
    }
  }, [])

  const facets = useMemo((): Facet[] => {
    const filterableFields = allFields.filter(f => f.key !== 'links')
    return filterableFields.map(field => {
      const valueCounts = new Map<string, number>()
      songs.forEach(song => {
        getSongValues(song, field.key).forEach(v => {
          valueCounts.set(v, (valueCounts.get(v) || 0) + 1)
        })
      })
      const options = Array.from(valueCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
      return { key: field.key, label: field.label, options }
    }).filter(f => f.options.length > 0)
  }, [songs, allFields, getSongValues])

  const toggleFacet = useCallback((facetKey: string, value: string) => {
    setSelectedFacets(prev => {
      const next = { ...prev }
      const set = new Set(prev[facetKey] || [])
      if (set.has(value)) {
        set.delete(value)
      } else {
        set.add(value)
      }
      if (set.size === 0) {
        delete next[facetKey]
      } else {
        next[facetKey] = set
      }
      return next
    })
  }, [])

  const clearFacet = useCallback((facetKey: string) => {
    setSelectedFacets(prev => {
      const next = { ...prev }
      delete next[facetKey]
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setSelectedFacets({})
    setSearch('')
  }, [])

  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      if (search) {
        const q = search.toLowerCase()
        const nameMatch = song.name.toLowerCase().includes(q)
        const tagMatch = song.tags.some(t => t.toLowerCase().includes(q))
        const vocalistMatch = song.vocalist.some(v => v.toLowerCase().includes(q))
        if (!nameMatch && !tagMatch && !vocalistMatch) return false
      }

      for (const [facetKey, selectedValues] of Object.entries(selectedFacets)) {
        if (selectedValues.size === 0) continue
        const songValues = getSongValues(song, facetKey)
        const hasMatch = songValues.some(v => selectedValues.has(v))
        if (!hasMatch) return false
      }

      return true
    })
  }, [songs, search, selectedFacets, getSongValues])

  const hasActiveFilters = search.length > 0 || Object.keys(selectedFacets).length > 0

  return {
    search,
    setSearch,
    selectedFacets,
    toggleFacet,
    clearFacet,
    clearAll,
    facets,
    filteredSongs,
    hasActiveFilters,
  }
}
