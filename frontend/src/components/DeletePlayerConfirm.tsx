// ABOUTME: Confirmation dialog for deleting players with safety checks
// ABOUTME: Prevents accidental deletions and provides clear feedback to users

import { useEffect, useRef } from 'react'
import { useDeletePlayer } from '../hooks/useApi'
import type { Player } from '../types/player'

interface DeletePlayerConfirmProps {
  player: Player
  onConfirm?: () => void
  onCancel?: () => void
  isOpen: boolean
}

export default function DeletePlayerConfirm({
  player,
  onConfirm,
  onCancel,
  isOpen,
}: DeletePlayerConfirmProps) {
  const deletePlayerMutation = useDeletePlayer()
  const modalRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement

      // Focus the cancel button when modal opens
      setTimeout(() => {
        cancelButtonRef.current?.focus()
      }, 0)

      // Handle Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel?.()
        }
      }

      // Trap focus within modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll(
            'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          if (!focusableElements || focusableElements.length === 0) return

          const firstElement = focusableElements[0] as HTMLElement
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault()
              lastElement.focus()
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault()
              firstElement.focus()
            }
          }
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTabKey)

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleTabKey)
      }
    } else {
      // Restore focus when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
        previousActiveElement.current = null
      }
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const handleDelete = async () => {
    try {
      await deletePlayerMutation.mutateAsync(player.id)
      onConfirm?.()
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Failed to delete player:', error)
    }
  }

  const hasGamesPlayed = player.games_played > 0

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel?.()
        }
      }}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-player-title"
        aria-describedby="delete-player-description"
      >
        <h3
          id="delete-player-title"
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          Delete Player
        </h3>

        <div id="delete-player-description" className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete <strong>{player.name}</strong>?
          </p>

          {hasGamesPlayed ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This player has played{' '}
                {player.games_played} game(s). Deleting will remove their record
                but preserve game history.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                This player hasn't played any games yet, so deleting is safe.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={deletePlayerMutation.isPending}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            ref={deleteButtonRef}
            onClick={handleDelete}
            disabled={deletePlayerMutation.isPending}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deletePlayerMutation.isPending ? 'Deleting...' : 'Delete Player'}
          </button>
        </div>

        {deletePlayerMutation.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              Failed to delete player. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
