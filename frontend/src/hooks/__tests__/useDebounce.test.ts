// ABOUTME: Test suite for useDebounce hook functionality
// ABOUTME: Tests debouncing behavior and timing

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('delays updating value until after delay period', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    expect(result.current).toBe('initial')

    // Update the value
    rerender({ value: 'updated', delay: 300 })

    // Should still be the old value before delay
    expect(result.current).toBe('initial')

    // Fast-forward time but not quite to the delay
    act(() => {
      vi.advanceTimersByTime(250)
    })
    expect(result.current).toBe('initial')

    // Fast-forward to after the delay
    act(() => {
      vi.advanceTimersByTime(60)
    })
    expect(result.current).toBe('updated')
  })

  it('resets timer if value changes before delay completes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    // Update value multiple times rapidly
    rerender({ value: 'first', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'second', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    rerender({ value: 'final', delay: 300 })

    // Should still be initial value since timer keeps resetting
    expect(result.current).toBe('initial')

    // After full delay, should have the latest value
    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(result.current).toBe('final')
  })

  it('works with different data types', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 200 } }
    )

    expect(result.current).toBe(42)

    rerender({ value: 100, delay: 200 })

    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(result.current).toBe(100)
  })
})
