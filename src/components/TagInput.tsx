import { useState, useRef, type KeyboardEvent } from 'react'

interface TagInputProps {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  suggestions?: string[]
}

export function TagInput({ values, onChange, placeholder = 'Type and press Enter', suggestions = [] }: TagInputProps) {
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addValue = (val: string) => {
    const trimmed = val.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setInput('')
    setShowSuggestions(false)
  }

  const removeValue = (idx: number) => {
    onChange(values.filter((_, i) => i !== idx))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault()
      addValue(input)
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      removeValue(values.length - 1)
    }
  }

  const filtered = suggestions.filter(
    s => s.toLowerCase().includes(input.toLowerCase()) && !values.includes(s)
  )

  return (
    <div className="tag-input">
      <div className="tag-input-chips">
        {values.map((v, i) => (
          <span key={i} className="chip">
            {v}
            <button type="button" className="chip-remove" onClick={() => removeValue(i)}>&times;</button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={values.length === 0 ? placeholder : ''}
          className="tag-input-field"
        />
      </div>
      {showSuggestions && input && filtered.length > 0 && (
        <ul className="tag-suggestions">
          {filtered.slice(0, 8).map(s => (
            <li key={s} onMouseDown={() => addValue(s)}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
