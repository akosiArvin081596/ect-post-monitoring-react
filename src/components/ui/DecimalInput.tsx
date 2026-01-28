interface DecimalInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  required?: boolean
  min?: number
  max?: number
  step?: number
  prefix?: string
  disabled?: boolean
}

export function DecimalInput({
  label,
  value,
  onChange,
  required = false,
  min = 0,
  max,
  step = 0.01,
  prefix,
  disabled = false,
}: DecimalInputProps) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base text-gray-500 dark:text-gray-400">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          required={required}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={`h-14 w-full rounded border border-gray-300 bg-white px-4 py-3 text-base leading-6 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:disabled:bg-gray-900 sm:text-lg ${prefix ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  )
}
