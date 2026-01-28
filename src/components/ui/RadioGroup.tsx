interface RadioOption {
  value: string
  label: string
}

interface RadioGroupProps {
  label: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  inline?: boolean
}

export function RadioGroup({
  label,
  options,
  value,
  onChange,
  required = false,
  inline = false,
}: RadioGroupProps) {
  return (
    <div className="mb-4">
      <label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <div className={inline ? 'flex flex-wrap gap-4' : 'space-y-3'}>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3"
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-base text-gray-700 dark:text-gray-300">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
