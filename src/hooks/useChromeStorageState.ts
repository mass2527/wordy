import { useCallback, useEffect, useState } from 'react';

type ChromeStorage = typeof chrome.storage;
type AreaName = keyof Pick<
  ChromeStorage,
  'sync' | 'local' | 'managed' | 'session'
>;
type StorageChangedEvent = ChromeStorage['onChanged'];

function useChromeStorageState<T>({
  key,
  defaultValue,
  areaName = 'local',
}: {
  key: string;
  defaultValue: T | (() => T);
  areaName?: AreaName;
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const handleStorageChanged: Parameters<
      StorageChangedEvent['addListener']
    >[0] = (changes, currentAreaName) => {
      for (const [currentKey, { newValue }] of Object.entries(changes)) {
        if (currentKey === key && currentAreaName === areaName) {
          setValue(newValue);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChanged);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChanged);
    };
  }, [key]);

  useEffect(() => {
    chrome.storage[areaName].get(key, (items) => {
      if (typeof items[key] === 'undefined') return;

      setValue(items[key]);
    });
  }, [areaName, key]);

  const setChromeStorage = useCallback(
    (value: T) => {
      chrome.storage[areaName].set({
        [key]: value,
      });
    },
    [areaName, key],
  );

  return [value, setChromeStorage] as const;
}

export default useChromeStorageState;
