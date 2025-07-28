// ABOUTME: Reusable loading spinner component with multiple sizes and variants
// ABOUTME: Provides consistent loading UI across the application with design system colors

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' // Updated to match button sizes
  variant?: 'primary' | 'secondary' | 'white' | 'current'
  className?: string
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  }

  const variantClasses = {
    primary: 'text-primary-600',
    secondary: 'text-neutral-500',
    white: 'text-white',
    current: 'text-current',
  }

  return (
    <div
      className={`inline-block ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg
        className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Loading skeleton for list items with enhanced shimmer effect
export function LoadingSkeleton({
  rows = 3,
  className = '',
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-neutral-200 dark:bg-dark-border h-10 w-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent animate-shimmer"></div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-dark-border rounded w-3/4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent animate-shimmer"></div>
              </div>
              <div className="h-3 bg-neutral-200 dark:bg-dark-border rounded w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Enhanced loading card skeleton with professional design
export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-neutral-0 dark:bg-dark-surface rounded-lg shadow-soft p-6 transition-colors duration-200 ${className}`}
    >
      <div className="space-y-4">
        <div className="h-6 bg-neutral-200 dark:bg-dark-border rounded w-1/4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent animate-shimmer"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-dark-border rounded relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-neutral-200 dark:bg-dark-border rounded w-5/6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-4 bg-neutral-200 dark:bg-dark-border rounded w-3/4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="h-10 bg-neutral-200 dark:bg-dark-border rounded-lg w-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-10 bg-neutral-200 dark:bg-dark-border rounded-lg w-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Deprecated - use Button component instead
export function LoadingButton({
  children,
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}: {
  children: React.ReactNode
  isLoading?: boolean
  disabled?: boolean
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`relative ${className} ${
        isLoading || disabled ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" variant="white" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  )
}
