import { useMemo } from 'react';
import { useFreshRef } from './useFreshRef';

export function usePersistentCallback<T extends (...args: any[]) => any>(
  callback: T,
) {
  const freshCallbackRef = useFreshRef(callback);

  const persistentCallback = useMemo(() => freshCallbackRef.current, []);

  return persistentCallback;
}
