interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  type?: 'text' | 'email' | 'tel'
  disabled?: boolean
}

export function TextInput({
  label,
  value,
  onChange,
  required = false,
  placeholder,
  type = 'text',
  disabled = false,
}: TextInputProps) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="h-14 w-full border border-gray-300 bg-white px-4 py-3 text-base leading-6 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:disabled:bg-gray-900 sm:text-lg"
      />
    </div>
  )
}
