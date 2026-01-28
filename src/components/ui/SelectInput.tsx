interface SelectOption {
  value: string
  label: string
}

interface SelectInputProps {
  label: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  disabled?: boolean
}

export function SelectInput({
  label,
  options,
  value,
  onChange,
  required = false,
  placeholder = 'Select...',
  disabled = false,
}: SelectInputProps) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="h-14 w-full rounded border border-gray-300 bg-white px-4 py-3 text-base leading-6 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:disabled:bg-gray-900 sm:text-lg"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
