import { useEffect, useRef } from 'react';

export function useFreshRef<T>(value: T) {
  const freshRef = useRef(value);

  useEffect(() => {
    freshRef.current = value;
  }, [value]);

  return freshRef;
}
