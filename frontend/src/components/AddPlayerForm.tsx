// ABOUTME: Form component for creating new players with validation
// ABOUTME: Uses TanStack Query mutation for API calls and React state for form handling

import { useState } from 'react'
import { useCreatePlayer } from '../hooks/useApi'
import type { PlayerCreate } from '../types/player'
import { OutlineButton, PrimaryButton } from './ui/Button'

interface AddPlayerFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function AddPlayerForm({
  onSuccess,
  onCancel,
}: AddPlayerFormProps) {
  const [formData, setFormData] = useState<PlayerCreate>({
    name: '',
    email: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createPlayerMutation = useCreatePlayer()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters'
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const playerData: PlayerCreate = {
        name: formData.name.trim(),
        email: formData.email?.trim() || undefined,
      }

      await createPlayerMutation.mutateAsync(playerData)

      // Reset form
      setFormData({ name: '', email: '' })
      setErrors({})

      // Call success callback
      onSuccess?.()
    } catch (error) {
      // Handle API errors
      if (error && typeof error === 'object' && 'message' in error) {
        setErrors({ submit: error.message as string })
      } else {
        setErrors({ submit: 'Failed to create player. Please try again.' })
      }
    }
  }

  const handleInputChange =
    (field: keyof PlayerCreate) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: '',
        }))
      }
    }

  return (
    <div className="bg-neutral-0 dark:bg-dark-surface rounded-lg shadow-soft p-6 transition-colors duration-200 border border-neutral-100 dark:border-dark-border">
      <h2 className="text-2xl font-bold text-neutral-900 dark:text-dark-text mb-6">
        Add New Player
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleInputChange('name')}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-neutral-0 dark:bg-dark-surface text-neutral-900 dark:text-dark-text placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
              errors.name
                ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500'
                : 'border-neutral-300 dark:border-dark-border focus:border-primary-500'
            }`}
            placeholder="Enter player name"
            disabled={createPlayerMutation.isPending}
            autoComplete="name"
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
            required
          />
          {errors.name && (
            <p
              id="name-error"
              className="mt-2 text-sm text-danger-600 dark:text-danger-400"
              role="alert"
            >
              {errors.name}
            </p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
          >
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-neutral-0 dark:bg-dark-surface text-neutral-900 dark:text-dark-text placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${
              errors.email
                ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500'
                : 'border-neutral-300 dark:border-dark-border focus:border-primary-500'
            }`}
            placeholder="Enter email address"
            disabled={createPlayerMutation.isPending}
            autoComplete="email"
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-2 text-sm text-danger-600 dark:text-danger-400"
              role="alert"
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* Submit error */}
        {errors.submit && (
          <div
            className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg"
            role="alert"
          >
            <p className="text-sm text-danger-600 dark:text-danger-400">
              {errors.submit}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-6">
          <PrimaryButton
            type="submit"
            isLoading={createPlayerMutation.isPending}
            loadingText="Creating..."
            fullWidth
            size="lg"
          >
            Create Player
          </PrimaryButton>

          {onCancel && (
            <OutlineButton
              type="button"
              onClick={onCancel}
              disabled={createPlayerMutation.isPending}
              size="lg"
            >
              Cancel
            </OutlineButton>
          )}
        </div>
      </form>
    </div>
  )
}
