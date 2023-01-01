import { useEffect } from 'react';
import { usePersistentCallback } from './usePersistentCallback';

export function useEventListener<K extends keyof WindowEventMap>({
  enabled,
  eventTarget,
  type,
  listener,
  options,
}: {
  enabled: boolean;
  eventTarget: Window & typeof globalThis;
  type: K;
  listener: (event: WindowEventMap[K]) => void;
  options?: boolean | AddEventListenerOptions;
}): void;
export function useEventListener<K extends keyof DocumentEventMap>({
  enabled,
  eventTarget,
  type,
  listener,
  options,
}: {
  enabled: boolean;
  eventTarget: Document;
  type: K;
  listener: (event: DocumentEventMap[K]) => void;
  options?: boolean | AddEventListenerOptions;
}): void;

export function useEventListener<
  K extends keyof WindowEventMap | keyof DocumentEventMap,
>({
  enabled = true,
  eventTarget,
  type,
  listener,
  options,
}: {
  enabled?: boolean;
  eventTarget: (Window & typeof globalThis) | Document;
  type: K;
  listener: K extends keyof WindowEventMap
    ? (event: WindowEventMap[K]) => void
    : K extends keyof DocumentEventMap
    ? (event: DocumentEventMap[K]) => void
    : never;
  options?: boolean | AddEventListenerOptions;
}) {
  const persistentListener = usePersistentCallback(listener);

  useEffect(() => {
    if (!enabled) return;

    eventTarget.addEventListener(
      type,
      persistentListener as EventListener,
      options,
    );
    return () => {
      eventTarget.removeEventListener(
        type,
        persistentListener as EventListener,
        options,
      );
    };
  }, [enabled, eventTarget, type, options]);
}
