import { useEffect } from 'react';
import { usePersistentCallback } from './usePersistentCallback';

export function useEventListener({
  enabled,
  eventTarget,
  type,
  listener,
  options,
}: {
  enabled: boolean;
  eventTarget: Window & typeof globalThis;
  type: keyof WindowEventMap;
  listener: EventListener;
  options?: boolean | AddEventListenerOptions;
}): void;
export function useEventListener({
  enabled,
  eventTarget,
  type,
  listener,
  options,
}: {
  enabled: boolean;
  eventTarget: Document;
  type: keyof DocumentEventMap;
  listener: EventListener;
  options?: boolean | AddEventListenerOptions;
}): void;

export function useEventListener<
  T extends (Window & typeof globalThis) | Document,
>({
  enabled = true,
  eventTarget,
  type,
  listener,
  options,
}: {
  enabled?: boolean;
  eventTarget: T;
  type: keyof WindowEventMap | keyof DocumentEventMap;
  listener: EventListener;
  options?: boolean | AddEventListenerOptions;
}) {
  const persistentListener = usePersistentCallback(listener);

  useEffect(() => {
    if (!enabled) return;

    eventTarget.addEventListener(type, persistentListener, options);
    return () => {
      eventTarget.removeEventListener(type, persistentListener, options);
    };
  }, [enabled, eventTarget, type, options]);
}
