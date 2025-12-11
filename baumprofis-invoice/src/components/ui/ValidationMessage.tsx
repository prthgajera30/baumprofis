import React from 'react'

export interface ValidationMessageProps {
  error?: string
  show?: boolean
  className?: string
}

/**
 * Consistent error message component for form validation
 */
export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  error,
  show = true,
  className = ''
}) => {
  if (!error || !show) return null

  return (
    <div
      className={`mt-1 text-sm text-red-600 flex items-center gap-1 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span>{error}</span>
    </div>
  )
}

/**
 * Wrapper component that adds error styling to input containers
 */
export interface InputWithValidationProps {
  children: React.ReactNode
  error?: string
  className?: string
}

export const InputWithValidation: React.FC<InputWithValidationProps> = ({
  children,
  error,
  className = ''
}) => {
  const hasError = !!error

  return (
    <div className={className}>
      <div className={hasError ? 'ring-1 ring-red-500 rounded-md' : ''}>
        {children}
      </div>
      <ValidationMessage error={error} />
    </div>
  )
}

export default ValidationMessage
