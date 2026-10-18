import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from 'react'
import { transliterate } from '../services/transliterate'

interface Props {
  value: string
  romanized: string
  itc: string
  onChangeNative: (native: string) => void
  onChangeRomanized: (romanized: string) => void
  placeholder?: string
}

export function TransliterateInput({
  value,
  romanized,
  itc,
  onChangeNative,
  onChangeRomanized,
  placeholder = 'Type in English...',
}: Props) {
  const [currentWord, setCurrentWord] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchSuggestions = useCallback(
    async (word: string) => {
      if (!word.trim() || !itc) {
        setSuggestions([])
        return
      }
      const results = await transliterate(word, itc)
      setSuggestions(results)
      setSelectedIdx(0)
      setShowSuggestions(results.length > 0)
    },
    [itc]
  )

  const commitWord = useCallback(
    (native: string, english: string) => {
      const prevNative = value ? value + ' ' : ''
      const prevRoman = romanized ? romanized + ' ' : ''
      onChangeNative(prevNative + native)
      onChangeRomanized(prevRoman + english)
      setCurrentWord('')
      setSuggestions([])
      setShowSuggestions(false)
    },
    [value, romanized, onChangeNative, onChangeRomanized]
  )

  const selectSuggestion = useCallback(
    (idx: number) => {
      const selected = suggestions[idx]
      if (selected) {
        commitWord(selected, currentWord.trim())
      }
    },
    [suggestions, currentWord, commitWord]
  )

  const handleInputChange = (text: string) => {
    // If no transliteration needed, just pass through
    if (!itc) {
      onChangeNative(text)
      onChangeRomanized(text)
      return
    }

    // Check if user typed a space — commit the previous word
    if (text.endsWith(' ') && currentWord.trim()) {
      // Auto-commit with the top suggestion
      if (suggestions.length > 0) {
        commitWord(suggestions[selectedIdx], currentWord.trim())
      } else {
        // No suggestions yet, trigger a fetch and commit
        transliterate(currentWord.trim(), itc).then(results => {
          if (results.length > 0) {
            commitWord(results[0], currentWord.trim())
          } else {
            commitWord(currentWord.trim(), currentWord.trim())
          }
        })
      }
      return
    }

    const word = text.trim()
    setCurrentWord(word)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(word), 150)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectSuggestion(selectedIdx)
    } else if (e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key) - 1
      if (idx < suggestions.length) {
        e.preventDefault()
        selectSuggestion(idx)
      }
    }
  }

  // Handle backspace into committed text
  const handleKeyDownCapture = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !currentWord && value) {
      e.preventDefault()
      // Pop last word from committed text
      const nativeWords = value.split(' ')
      const romanWords = romanized.split(' ')
      const poppedRoman = romanWords.pop() || ''
      onChangeNative(nativeWords.slice(0, -1).join(' '))
      onChangeRomanized(romanWords.join(' '))
      setCurrentWord(poppedRoman)
      fetchSuggestions(poppedRoman)
    }
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Display: committed native text + current word being typed
  const displayCommitted = value || ''

  return (
    <div className="translit-input-wrapper">
      <div className="translit-display" onClick={() => inputRef.current?.focus()}>
        {displayCommitted && (
          <span className="translit-committed">{displayCommitted}</span>
        )}
        <input
          ref={inputRef}
          type="text"
          className="translit-typing"
          value={currentWord}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyDownCapture={handleKeyDownCapture}
          onBlur={() => {
            // Auto-commit on blur if there's a pending word
            if (currentWord.trim() && suggestions.length > 0) {
              setTimeout(() => {
                commitWord(suggestions[selectedIdx], currentWord.trim())
              }, 150)
            } else if (currentWord.trim() && itc) {
              transliterate(currentWord.trim(), itc).then(results => {
                if (results.length > 0) commitWord(results[0], currentWord.trim())
                else commitWord(currentWord.trim(), currentWord.trim())
              })
            }
          }}
          placeholder={!displayCommitted ? placeholder : ''}
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="translit-suggestions">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className={i === selectedIdx ? 'selected' : ''}
              onMouseDown={() => selectSuggestion(i)}
            >
              <span className="translit-suggestion-num">{i + 1}</span>
              <span className="translit-suggestion-text">{s}</span>
            </li>
          ))}
        </ul>
      )}

      {romanized && itc && (
        <div className="translit-romanized">{romanized}{currentWord ? ' ' + currentWord : ''}</div>
      )}
    </div>
  )
}
