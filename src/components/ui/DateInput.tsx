interface DateInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  max?: string
  min?: string
  disabled?: boolean
}

export function DateInput({
  label,
  value,
  onChange,
  required = false,
  max,
  min,
  disabled = false,
}: DateInputProps) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        max={max}
        min={min}
        disabled={disabled}
        className="h-14 w-full rounded-lg border border-gray-300 px-4 py-3 text-base leading-6 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800 sm:text-lg"
      />
    </div>
  )
}
