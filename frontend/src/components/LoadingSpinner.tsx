// ABOUTME: Reusable loading spinner component with multiple sizes and variants
// ABOUTME: Provides consistent loading UI across the application

import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  variant?: 'primary' | 'secondary' | 'white'
  className?: string
}

export default function LoadingSpinner({
  size = 'medium',
  variant = 'primary',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  }

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-500',
    white: 'text-white',
  }

  return (
    <div className={`inline-block ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${variantClasses[variant]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
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
    </div>
  )
}

// Loading skeleton for list items
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
            <div className="rounded-full bg-gray-200 dark:bg-gray-600 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Loading card skeleton
export function LoadingCard({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200 ${className}`}
    >
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}

// Loading button state
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
          <LoadingSpinner size="small" variant="white" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  )
}
