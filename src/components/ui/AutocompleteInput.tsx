import { useState, useRef, useEffect, useCallback } from 'react'

interface Suggestion {
  beneficiary_name: string
  birthdate: string | null
  age: number | null
  sex: string | null
  beneficiary_classification: string[]
  household_id_no: string | null
  demographic_classification: string[]
  ip_specify: string | null
  highest_educational_attainment: string | null
  educational_attainment_specify: string | null
}

interface AutocompleteInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onSelect: (suggestion: Suggestion) => void
  fetchSuggestions: (query: string) => Promise<Suggestion[]>
  required?: boolean
  placeholder?: string
}

export function AutocompleteInput({
  label,
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  required = false,
  placeholder,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleInputChange = useCallback(
    (inputValue: string) => {
      onChange(inputValue)
      setActiveIndex(-1)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (inputValue.length < 2) {
        setSuggestions([])
        setIsOpen(false)
        return
      }

      debounceRef.current = setTimeout(async () => {
        const results = await fetchSuggestions(inputValue)
        setSuggestions(results)
        setIsOpen(results.length > 0)
      }, 300)
    },
    [onChange, fetchSuggestions]
  )

  const handleSelect = useCallback(
    (suggestion: Suggestion) => {
      onChange(suggestion.beneficiary_name)
      onSelect(suggestion)
      setSuggestions([])
      setIsOpen(false)
    },
    [onChange, onSelect]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="relative mb-4" ref={containerRef}>
      <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        className="h-14 w-full border border-gray-300 bg-white px-4 py-3 text-base leading-6 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 sm:text-lg"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.beneficiary_name}
              onClick={() => handleSelect(suggestion)}
              className={`cursor-pointer px-4 py-3 text-base text-gray-900 dark:text-white ${
                index === activeIndex
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {suggestion.beneficiary_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
