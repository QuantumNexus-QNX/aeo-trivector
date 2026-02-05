import { useRef, useCallback } from 'react'

export function usePersistFn<T extends (...args: any[]) => any>(fn: T) {
  const fnRef = useRef<T>(fn)
  fnRef.current = fn

  const persistFn = useCallback((...args: Parameters<T>) => {
    return fnRef.current(...args)
  }, [])

  return persistFn as T
}
