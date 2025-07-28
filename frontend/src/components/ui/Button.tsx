// ABOUTME: Professional button component system with multiple variants and states
// ABOUTME: Implements design system specifications with hover effects, shadows, and accessibility

import React from 'react'
import LoadingSpinner from '../LoadingSpinner'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'outline'
  | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: `
    bg-primary-600 hover:bg-primary-700 active:bg-primary-800
    text-white font-semibold
    shadow-lg hover:shadow-colored-primary
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    border border-transparent
  `,
  secondary: `
    bg-neutral-0 hover:bg-neutral-50 active:bg-neutral-100
    text-primary-600 font-semibold
    border border-primary-600 hover:border-primary-700
    shadow-lg hover:shadow-colored-primary
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    dark:bg-dark-surface dark:hover:bg-dark-border dark:text-primary-400
  `,
  success: `
    bg-success-600 hover:bg-success-700 active:bg-success-800
    text-white font-semibold
    shadow-lg hover:shadow-colored-success
    focus:ring-2 focus:ring-success-500 focus:ring-offset-2
    border border-transparent
  `,
  danger: `
    bg-danger-600 hover:bg-danger-700 active:bg-danger-800
    text-white font-semibold
    shadow-lg hover:shadow-colored-danger
    focus:ring-2 focus:ring-danger-500 focus:ring-offset-2
    border border-transparent
  `,
  outline: `
    bg-transparent hover:bg-neutral-50 active:bg-neutral-100
    text-neutral-700 hover:text-neutral-900 font-medium
    border border-neutral-300 hover:border-neutral-400
    shadow-sm hover:shadow-md
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    dark:text-neutral-300 dark:hover:text-neutral-100 dark:hover:bg-dark-border
    dark:border-dark-border dark:hover:border-neutral-500
  `,
  ghost: `
    bg-transparent hover:bg-neutral-100 active:bg-neutral-200
    text-neutral-600 hover:text-neutral-900 font-medium
    border border-transparent
    shadow-none hover:shadow-sm
    focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-dark-border
  `,
}

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm min-h-[36px]',
  md: 'px-6 py-3 text-base min-h-[44px]',
  lg: 'px-8 py-4 text-lg min-h-[52px]',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    rounded-lg transition-all duration-200
    transform hover:scale-105
    focus:outline-none focus:scale-105
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:transform-none disabled:shadow-none
    font-medium leading-tight
    ${fullWidth ? 'w-full' : ''}
  `

  const variantClasses = buttonVariants[variant]
  const sizeClasses = buttonSizes[size]

  const isDisabled = disabled || isLoading

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && !isLoading && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <LoadingSpinner
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          className="flex-shrink-0"
        />
      )}

      {/* Button Text */}
      <span className="truncate">
        {isLoading && loadingText ? loadingText : children}
      </span>

      {/* Right Icon */}
      {rightIcon && !isLoading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  )
}

// Specialized button components for common use cases
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />
}

export function SuccessButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="success" {...props} />
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />
}

export function OutlineButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="outline" {...props} />
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="ghost" {...props} />
}

// Icon Button for actions with just icons
interface IconButtonProps
  extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: React.ReactNode
  'aria-label': string
}

export function IconButton({ icon, ...props }: IconButtonProps) {
  return (
    <Button {...props} className={`!px-3 ${props.className || ''}`}>
      {icon}
    </Button>
  )
}
