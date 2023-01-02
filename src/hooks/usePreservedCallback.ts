import { useCallback } from 'react';
import { useFreshRef } from './useFreshRef';

export function usePreservedCallback<T extends (...args: any[]) => any>(
  callback: T,
) {
  const freshRef = useFreshRef(callback);

  const preservedCallback = useCallback(
    (...args: any[]) => {
      return freshRef.current(...args);
    },
    [freshRef],
  ) as T;

  return preservedCallback;
}
