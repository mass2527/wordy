import { useEffect, useState } from 'react';

export function useLocalStorageState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return defaultValue;
    }

    return JSON.parse(storedValue);
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
